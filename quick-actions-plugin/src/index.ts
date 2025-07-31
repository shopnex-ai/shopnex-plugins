import type { Config } from "payload";
import { QuickAction } from "./types";
import { buildActions } from "./utils/build-actions";
import { JSX } from "react";
import { iconMap } from "./utils/icon-map";

type QuickActionsPluginConfig = {
    position?: "actions" | "before-nav-links" | "after-nav-links";
    overrideActions?: QuickAction[];
    overrideIconsMap?: Record<string, JSX.Element>;
    defaultCreateActions?: boolean;
};

export const quickActionsPlugin =
    (pluginConfig: QuickActionsPluginConfig) =>
    (config: Config): Config => {
        const isDefaultCreateActions =
            pluginConfig.defaultCreateActions ?? true;
        const position = pluginConfig.position ?? "actions";
        const currentIconMap = pluginConfig.overrideIconsMap ?? iconMap;
        const actions =
            pluginConfig.overrideActions ??
            buildActions(config, currentIconMap, isDefaultCreateActions);
        config.admin?.components?.providers?.push({
            path: "@shopnex/quick-actions-plugin/client#CommandBar",
            clientProps: {
                actions,
            },
        });
        if (position === "actions") {
            config.admin?.components?.actions?.push({
                path: "@shopnex/quick-actions-plugin/client#QuickActions",
                clientProps: {
                    position: "actions",
                },
            });
        }

        if (position === "before-nav-links") {
            config.admin?.components?.beforeNavLinks?.unshift({
                path: "@shopnex/quick-actions-plugin/client#QuickActions",
            });
        }

        if (position === "after-nav-links") {
            config.admin?.components?.afterNavLinks?.push({
                path: "@shopnex/quick-actions-plugin/client#QuickActions",
            });
        }
        return config;
    };
