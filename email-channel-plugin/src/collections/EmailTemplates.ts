import { CollectionConfig } from "payload";

export const EmailTemplates = (): CollectionConfig => {
    return {
        slug: "email-templates",
        admin: {
            group: "Plugins",
            components: {
                views: {
                    edit: {
                        root: {
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
            {
                label: "Email Template",
                type: "collapsible",
                fields: [
                    { name: "name", type: "text" },
                    {
                        name: "html",
                        type: "text",
                    },
                    {
                        name: "json",
                        type: "json",
                    },
                ],
            },
        ],
    };
};
