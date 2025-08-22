import type { Config } from "payload";
import { QuickAction, QuickActionsPluginConfig } from "./types";
import { buildActions } from "./utils/build-actions";
import { iconMap } from "./utils/icon-map";
import { validateConfig } from "./utils/validate-config";
import pkg from "../package.json";

export type {
    QuickAction,
    QuickActionsPluginConfig,
    PluginHooks,
} from "./types";
export { QuickActionBuilder, createAction } from "./utils/action-builder";
export {
    filterActions,
    sortActionsByPriority,
    groupActionsByCategory,
} from "./utils/action-filters";
export { iconMap } from "./utils/icon-map";

export const quickActionsPlugin = (
    pluginConfig: QuickActionsPluginConfig = {}
) => {
    return (config: Config): Config => {
        const validatedConfig = validateConfig(pluginConfig);

        const {
            position = "actions",
            defaultCreateActions = true,
            enableDefaultActions = true,
            overrideIconsMap = iconMap,
            hooks,
            excludeCollections = [],
            excludeGlobals = [],
        } = validatedConfig;

        hooks?.beforeActionsGenerated?.(config);

        let actions: QuickAction[];

        if (validatedConfig.overrideActions) {
            actions = validatedConfig.overrideActions;
        } else if (validatedConfig.customActionBuilder) {
            actions = validatedConfig.customActionBuilder(config);
        } else {
            actions = buildActions({
                config,
                iconMap: overrideIconsMap,
                defaultCreateActions,
                enableDefaultActions,
                excludeCollections,
                excludeGlobals,
            });
        }

        if (validatedConfig.additionalActions) {
            actions = [...actions, ...validatedConfig.additionalActions];
        }

        if (hooks?.afterActionsGenerated) {
            actions = hooks.afterActionsGenerated(actions);
        }

        const ensureComponentsExist = (config: Config) => {
            config.admin = config.admin || {};
            config.admin.components = config.admin.components || {};
            config.admin.components.providers =
                config.admin.components.providers || [];
            config.admin.components.actions =
                config.admin.components.actions || [];
            config.admin.components.beforeNavLinks =
                config.admin.components.beforeNavLinks || [];
            config.admin.components.afterNavLinks =
                config.admin.components.afterNavLinks || [];
        };

        ensureComponentsExist(config);

        config.admin!.components!.providers!.push({
            path: "@shopnex/quick-actions-plugin/client#CommandBar",
            clientProps: {
                actions,
                kbarOptions: validatedConfig.kbarOptions,
                hooks,
            },
        });

        const quickActionsClientProps = {
            position,
            kbarOptions: validatedConfig.kbarOptions,
        };

        switch (position) {
            case "actions":
                config.admin!.components!.actions!.push({
                    path: "@shopnex/quick-actions-plugin/client#QuickActions",
                    clientProps: quickActionsClientProps,
                });
                break;
            case "before-nav-links":
                config.admin!.components!.beforeNavLinks!.unshift({
                    path: "@shopnex/quick-actions-plugin/client#QuickActions",
                    clientProps: quickActionsClientProps,
                });
                break;
            case "after-nav-links":
                config.admin!.components!.afterNavLinks!.push({
                    path: "@shopnex/quick-actions-plugin/client#QuickActions",
                    clientProps: quickActionsClientProps,
                });
                break;
        }

        const incomingOnInit = config.onInit;

        config.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
            await config.custom?.syncPlugin?.(payload, {
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                license: pkg.license,
                author: pkg.author,
                icon: pkg.icon,
                category: pkg.category,
            });
        };

        return config;
    };
};

export default quickActionsPlugin;
