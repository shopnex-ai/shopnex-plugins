import type { CollectionConfig, Config } from "payload";
import { EmailTemplates } from "./collections/EmailTemplates";
import pkg from "../package.json";

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

export default easyEmailPlugin;
