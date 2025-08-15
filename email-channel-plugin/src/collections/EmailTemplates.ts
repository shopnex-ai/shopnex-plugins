import { CollectionConfig, deepMergeWithCombinedArrays } from "payload";

type EmailTemplatesProps = {
    overrides?: Partial<CollectionConfig>;
};

export const EmailTemplates = ({
    overrides = {},
}: EmailTemplatesProps): CollectionConfig => {
    const baseConfig: CollectionConfig = {
        slug: "email-templates",
        access: {
            create: () => true,
            read: () => true,
            update: ({ req }) => {
                const shopHandle = req.headers.get("x-payload-sdk-token");
                const user = shopHandle
                    ? req.payload.decrypt(shopHandle!)
                    : req.user;
                if (user) {
                    return true;
                }
                return false;
            },
            delete: () => true,
        },
        admin: {
            group: "Plugins",
            components: {
                views: {
                    edit: {
                        default: {
                            path: "@shopnex/email-channel-plugin/client#EmailTemplateEditView",
                            Component:
                                "@shopnex/email-channel-plugin/client#EmailTemplateEditView",
                        },
                    },
                },
            },

            defaultColumns: ["name", "createdAt", "updatedAt"],
            useAsTitle: "name",
        },
        fields: [
            // {
            //     name: "emailEditor",
            //     type: "ui",
            //     admin: {
            //         components: {
            //             Fields: {
            //                 path: "@shopnex/email-channel-plugin/client#EmailTemplateEditView",
            //             },
            //             Field: {
            //                 path: "@shopnex/email-channel-plugin/client#EmailTemplateEditView",
            //             },
            //         },
            //     },
            // },
            { name: "name", type: "text" },
            {
                name: "html",
                type: "textarea",
                admin: {
                    disabled: true,
                },
            },
            {
                name: "json",
                type: "json",
            },
        ],
    };
    return deepMergeWithCombinedArrays(baseConfig, overrides);
};
