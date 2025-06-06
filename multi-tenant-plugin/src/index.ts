import type { AcceptedLanguages } from "@payloadcms/translations";
import type { CollectionConfig, Config } from "payload";

import type { MultiTenantPluginConfig } from "./types";

import { defaults } from "./defaults";
import { tenantField } from "./fields/tenantField/index";
import { addTenantCleanup } from "./hooks/afterTenantDelete";
import { filterDocumentsBySelectedTenant } from "./list-filters/filterDocumentsBySelectedTenant";
import { filterTenantsBySelectedTenant } from "./list-filters/filterTenantsBySelectedTenant";
import { filterUsersBySelectedTenant } from "./list-filters/filterUsersBySelectedTenant";
import { addCollectionAccess } from "./utilities/addCollectionAccess";
import { addFilterOptionsToFields } from "./utilities/addFilterOptionsToFields";
import { combineListFilters } from "./utilities/combineListFilters";

export const multiTenantPlugin =
    <ConfigType>(pluginConfig: MultiTenantPluginConfig<ConfigType>) =>
    (incomingConfig: Config): Config => {
        if (pluginConfig.enabled === false) {
            return incomingConfig;
        }

        /**
         * Set defaults
         */
        const userHasAccessToAllTenants: Required<
            MultiTenantPluginConfig<ConfigType>
        >["userHasAccessToAllTenants"] =
            typeof pluginConfig.userHasAccessToAllTenants === "function"
                ? pluginConfig.userHasAccessToAllTenants
                : () => false;
        const tenantsCollectionSlug = (pluginConfig.tenantsSlug =
            pluginConfig.tenantsSlug || defaults.tenantCollectionSlug);
        const tenantFieldName =
            pluginConfig?.tenantField?.name || defaults.tenantFieldName;
        const tenantsArrayFieldName =
            pluginConfig?.tenantsArrayField?.arrayFieldName ||
            defaults.tenantsArrayFieldName;
        const tenantsArrayTenantFieldName =
            pluginConfig?.tenantsArrayField?.arrayTenantFieldName ||
            defaults.tenantsArrayTenantFieldName;
        let tenantSelectorLabel =
            pluginConfig.tenantSelectorLabel || defaults.tenantSelectorLabel;

        /**
         * Add defaults for admin properties
         */
        if (!incomingConfig.admin) {
            incomingConfig.admin = {};
        }
        if (!incomingConfig.admin?.components) {
            incomingConfig.admin.components = {
                actions: [],
                beforeNavLinks: [],
                providers: [],
            };
        }
        if (!incomingConfig.admin.components?.providers) {
            incomingConfig.admin.components.providers = [];
        }
        if (!incomingConfig.admin.components?.actions) {
            incomingConfig.admin.components.actions = [];
        }
        if (!incomingConfig.admin.components?.beforeNavLinks) {
            incomingConfig.admin.components.beforeNavLinks = [];
        }
        if (!incomingConfig.collections) {
            incomingConfig.collections = [];
        }

        /**
         * Add tenant selector localized labels
         */
        if (
            pluginConfig.tenantSelectorLabel &&
            typeof pluginConfig.tenantSelectorLabel === "object"
        ) {
            if (!incomingConfig.i18n) {
                incomingConfig.i18n = {};
            }
            Object.entries(pluginConfig.tenantSelectorLabel).forEach(
                ([_locale, label]) => {
                    const locale = _locale as AcceptedLanguages;
                    if (!incomingConfig.i18n) {
                        incomingConfig.i18n = {};
                    }
                    if (!incomingConfig.i18n.translations) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        incomingConfig.i18n.translations = {};
                    }
                    if (!(locale in incomingConfig.i18n.translations)) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        incomingConfig.i18n.translations[locale] = {};
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (
                        !(
                            "multiTenant" in
                            (incomingConfig as any)?.i18n?.translations?.[
                                locale
                            ]
                        )
                    ) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        incomingConfig.i18n.translations[locale].multiTenant =
                            {};
                    }
                    // @ts-ignore
                    incomingConfig.i18n.translations[
                        locale
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                    ].multiTenant.selectorLabel = label;
                    tenantSelectorLabel = "multiTenant:selectorLabel";
                }
            );
        }

        /**
         * Add tenants array field to users collection
         */
        const adminUsersCollection = incomingConfig.collections.find(
            ({ slug, auth }) => {
                if (incomingConfig.admin?.user) {
                    return slug === incomingConfig.admin.user;
                } else if (auth) {
                    return true;
                }
            }
        );

        if (!adminUsersCollection) {
            throw Error("An auth enabled collection was not found");
        }

        /**
         * Add tenants array field to users collection
         */
        // if (pluginConfig?.tenantsArrayField?.includeDefaultField !== false) {
        //     adminUsersCollection.fields.push(
        //         tenantsArrayField({
        //             ...(pluginConfig?.tenantsArrayField || {}),
        //             tenantsArrayFieldName,
        //             tenantsArrayTenantFieldName,
        //             tenantsCollectionSlug,
        //         }),
        //     );
        // }

        addCollectionAccess({
            adminUsersSlug: adminUsersCollection.slug,
            collection: adminUsersCollection,
            fieldName: `${tenantsArrayFieldName}.${tenantsArrayTenantFieldName}`,
            tenantsArrayFieldName,
            tenantsArrayTenantFieldName,
            userHasAccessToAllTenants,
        });

        if (pluginConfig.useUsersTenantFilter !== false) {
            if (!adminUsersCollection.admin) {
                adminUsersCollection.admin = {};
            }

            adminUsersCollection.admin.baseListFilter = combineListFilters({
                baseListFilter: adminUsersCollection.admin?.baseListFilter,
                customFilter: (args) =>
                    filterUsersBySelectedTenant({
                        req: args.req,
                        tenantsArrayFieldName,
                        tenantsArrayTenantFieldName,
                        tenantsCollectionSlug,
                    }),
            });
        }

        let tenantCollection: CollectionConfig | undefined;

        const [collectionSlugs, globalCollectionSlugs] = Object.keys(
            pluginConfig.collections
        ).reduce<[string[], string[]]>(
            (acc, slug) => {
                // @ts-ignore
                if (pluginConfig?.collections?.[slug]?.isGlobal) {
                    acc[1].push(slug);
                } else {
                    acc[0].push(slug);
                }

                return acc;
            },
            [[], []]
        );

        /**
         * Modify collections
         */
        incomingConfig.collections.forEach((collection) => {
            /**
             * Modify tenants collection
             */
            if (collection.slug === tenantsCollectionSlug) {
                tenantCollection = collection;

                if (pluginConfig.useTenantsCollectionAccess !== false) {
                    /**
                     * Add access control constraint to tenants collection
                     * - constrains access a users assigned tenants
                     */
                    addCollectionAccess({
                        adminUsersSlug: adminUsersCollection.slug,
                        collection,
                        fieldName: "id",
                        tenantsArrayFieldName,
                        tenantsArrayTenantFieldName,
                        userHasAccessToAllTenants,
                    });
                }

                if (pluginConfig.useTenantsListFilter !== false) {
                    /**
                     * Add list filter to tenants collection
                     * - filter by selected tenant
                     */
                    if (!collection.admin) {
                        collection.admin = {};
                    }

                    collection.admin.baseListFilter = combineListFilters({
                        baseListFilter: collection.admin?.baseListFilter,
                        customFilter: (args) =>
                            filterTenantsBySelectedTenant({
                                req: args.req,
                                tenantsCollectionSlug,
                            }),
                    });
                }

                if (pluginConfig.cleanupAfterTenantDelete !== false) {
                    /**
                     * Add cleanup logic when tenant is deleted
                     * - delete documents related to tenant
                     * - remove tenant from users
                     */
                    addTenantCleanup({
                        collection,
                        enabledSlugs: [
                            ...collectionSlugs,
                            ...globalCollectionSlugs,
                        ],
                        tenantFieldName,
                        tenantsCollectionSlug,
                        usersSlug: adminUsersCollection.slug,
                        usersTenantsArrayFieldName: tenantsArrayFieldName,
                        usersTenantsArrayTenantFieldName:
                            tenantsArrayTenantFieldName,
                    });
                }
                // @ts-ignore
            } else if (pluginConfig.collections?.[collection.slug]) {
                // @ts-ignore
                const isGlobal = Boolean(
                    pluginConfig.collections[collection.slug]?.isGlobal
                );

                if (isGlobal) {
                    collection.disableDuplicate = true;
                }

                /**
                 * Modify enabled collections
                 */
                addFilterOptionsToFields({
                    config: incomingConfig,
                    fields: collection.fields,
                    tenantEnabledCollectionSlugs: collectionSlugs,
                    tenantEnabledGlobalSlugs: globalCollectionSlugs,
                    tenantFieldName,
                    tenantsCollectionSlug,
                });

                /**
                 * Add tenant field to enabled collections
                 */
                collection.fields.splice(
                    0,
                    0,
                    tenantField({
                        ...(pluginConfig?.tenantField || {}),
                        name: tenantFieldName,
                        debug: pluginConfig.debug,
                        tenantsCollectionSlug,
                        unique: isGlobal,
                    })
                );

                if (
                    pluginConfig.collections[collection.slug]
                        ?.useBaseListFilter !== false
                ) {
                    /**
                     * Add list filter to enabled collections
                     * - filters results by selected tenant
                     */
                    if (!collection.admin) {
                        collection.admin = {};
                    }

                    collection.admin.baseListFilter = combineListFilters({
                        baseListFilter: collection.admin?.baseListFilter,
                        customFilter: (args) =>
                            filterDocumentsBySelectedTenant({
                                req: args.req,
                                tenantFieldName,
                                tenantsCollectionSlug,
                                userHasAccessToAllTenants,
                            }),
                    });
                }

                if (
                    pluginConfig.collections[collection.slug]
                        ?.useTenantAccess !== false
                ) {
                    /**
                     * Add access control constraint to tenant enabled collection
                     */
                    addCollectionAccess({
                        adminUsersSlug: adminUsersCollection.slug,
                        collection,
                        fieldName: tenantFieldName,
                        tenantsArrayFieldName,
                        tenantsArrayTenantFieldName,
                        userHasAccessToAllTenants,
                    });
                }
            }
        });

        if (!tenantCollection) {
            throw new Error(
                `Tenants collection not found with slug: ${tenantsCollectionSlug}`
            );
        }

        /**
         * Add TenantSelectionProvider to admin providers
         */
        incomingConfig.admin.components.providers.push({
            clientProps: {
                tenantsCollectionSlug: tenantCollection.slug,
                useAsTitle: tenantCollection.admin?.useAsTitle || "id",
            },
            path: "@shopnex/multi-tenant-plugin/rsc#TenantSelectionProvider",
        });

        /**
         * Add global redirect action
         */
        if (globalCollectionSlugs.length) {
            for (const slug of globalCollectionSlugs) {
                const collection = incomingConfig.collections.find(
                    ({ slug: collectionSlug }) => collectionSlug === slug
                );
                if (!collection) {
                    throw new Error(`Collection not found with slug: ${slug}`);
                }
                if (!collection.admin) {
                    collection.admin = {};
                }
                if (!collection.admin.components) {
                    collection.admin.components = {};
                }
                if (!collection.admin.components.views) {
                    collection.admin.components.views = {};
                }
                collection.admin.components.views = {
                    list: {
                        Component: "@shopnex/multi-tenant-plugin/rsc#EmptyList",
                    },
                };
            }
            incomingConfig.admin.components.actions.push({
                path: "@shopnex/multi-tenant-plugin/rsc#GlobalViewRedirect",
                serverProps: {
                    globalSlugs: globalCollectionSlugs,
                    tenantFieldName,
                    tenantsCollectionSlug,
                    useAsTitle: tenantCollection.admin?.useAsTitle || "id",
                },
            });
        }

        /**
         * Add tenant selector to admin UI
         */
        incomingConfig.admin.components.beforeNavLinks.push({
            clientProps: {
                label: tenantSelectorLabel,
            },
            path: "@shopnex/multi-tenant-plugin/client#TenantSelector",
        });
        incomingConfig.admin.components.beforeNavLinks.push({
            clientProps: {
                label: tenantSelectorLabel,
            },
            path: "@shopnex/multi-tenant-plugin/client#TenantDetails",
        });
        return incomingConfig;
    };
