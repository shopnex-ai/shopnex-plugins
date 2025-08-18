import type { CollectionConfig, Config } from "payload";
import { EmailTemplates } from "./collections/EmailTemplates";

type EmailChannelPluginConfig = {
    enabled?: boolean;
    collectionOverrides?: Partial<CollectionConfig>;
};

export const easyEmailPlugin = (pluginConfig: EmailChannelPluginConfig) => {
    return (config: Config): Config => {
        config.collections?.push(
            EmailTemplates({
                overrides: pluginConfig.collectionOverrides,
            })
        );
        return config;
    };
};

export default easyEmailPlugin;
