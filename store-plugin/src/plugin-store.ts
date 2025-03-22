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
                    Component: "store-plugin/rsc#PluginListView",
                },
                edit: {
                    root: {
                        Component: "store-plugin/rsc#PluginEditView",
                        path: "plugins/:pluginId",
                    },
                },
            },
        },
    },
    disableDuplicate: true,
    fields: [
        {
            name: "pluginIcon",
            type: "ui",

            admin: {
                components: {
                    Cell: "store-plugin/rsc#PluginIcon",
                },
            },
            label: "",
        },
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

        {
            name: "pluginDescription",
            type: "textarea",
            defaultValue: "",
        },
        {
            name: "test123",
            type: "text",
            defaultValue: () => {
                return "testing...";
            },
        },
        {
            name: "test999",
            type: "text",
            defaultValue: "testing...,,",
        },
        {
            name: "actions",
            type: "ui",
            admin: {
                components: {
                    // Cell: 'store-plugin/rsc#Actions',
                    Field: "store-plugin/rsc#Actions",
                },
            },
        },
    ],
    labels: {
        plural: "Plugins Space",
        singular: "Plugin Space",
    },
};
