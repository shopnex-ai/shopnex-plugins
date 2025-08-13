import type { Config } from "payload";
import { EmailTemplates } from "./collections/EmailTemplates";

type EmailChannelPluginConfig = {};

export const emailTemplatesPlugin = (
    pluginConfig: EmailChannelPluginConfig
) => {
    return (config: Config): Config => {
        config.collections?.push(EmailTemplates());
        return config;
    };
};

export default emailTemplatesPlugin;
