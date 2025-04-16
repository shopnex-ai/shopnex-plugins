import type { CollectionConfig } from "payload";

export const PluginStore: CollectionConfig = {
    slug: "plugins-space",
    admin: {
        defaultColumns: ["displayName", "pluginVersion", "pluginIcon"],
        group: "Plugins",
        hideAPIURL: true,
        useAsTitle: "displayName",
        components: {
            views: {
                list: {
                    Component: "@shopnex/store-plugin/client#PluginListView",
                },
                edit: {
                    root: {
                        Component: "@shopnex/store-plugin/client#PluginEditView",
                        path: "/plugins/:pluginId",
                    },
                },
            },
        },
    },
    disableDuplicate: true,
    fields: [
        {
            name: "pluginName",
            type: "text",
            admin: {
                disabled: true,
            },
        },
        {
            type: "row",
            fields: [
                {
                    name: "displayName",
                    type: "text",

                    label: "Plugin Name",
                },
                {
                    name: "pluginVersion",
                    type: "text",
                },
            ],
        },
    ],
    labels: {
        plural: "Plugin Space",
        singular: "Plugin Space",
    },
};
