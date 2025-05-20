import type { ServerComponentProps } from "payload";

import React from "react";

import { Icon } from "../icons/icon";

export const PluginIcon = ({ rowData }: any) => {
    if (!rowData?.pluginName) {
        return null;
    }
    const { pluginName } = rowData;
    const formattedPluginName = pluginName.replace("-plugin", "");
    return <Icon name={formattedPluginName} />;
};
