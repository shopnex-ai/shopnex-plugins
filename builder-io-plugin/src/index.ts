import type { Config } from "payload";
import { BUILDER_IO_PUBLIC_API, SOURCE_BUILDER_IO_PUBLIC_KEY } from "./constants";
import { importPageHook } from "./hooks/import-page";

interface BuilderIoConfig {
    enabled?: boolean;
    publicKey?: string;
    privateKey?: string;
    collectionDesignSlug?: string;
    collectionPagesSlug?: string;
}

const defaultConfig: BuilderIoConfig = {
    enabled: true,
    publicKey: process.env.BUILDER_IO_PUBLIC_KEY,
    privateKey: process.env.BUILDER_IO_PRIVATE_KEY,
    collectionDesignSlug: "design",
    collectionPagesSlug: "pages",
};

export const builderIoPlugin =
    (pluginConfig: BuilderIoConfig = defaultConfig) =>
    (incomingConfig: Config): Config => {
        const finalConfig: BuilderIoConfig = {
            ...defaultConfig,
            ...pluginConfig,
        };
        const { enabled } = finalConfig;

        const pagesCollection = incomingConfig.collections?.find(
            (collection) => collection.slug === finalConfig.collectionPagesSlug,
        );

        if (!pagesCollection || typeof pagesCollection !== "object") {
            throw new Error("Pages collection not found");
        }

        if (!pagesCollection.hooks) {
            pagesCollection.hooks = {};
        }

        if (!Array.isArray(pagesCollection.hooks.afterChange)) {
            pagesCollection.hooks.afterChange = [];
        }

        pagesCollection.hooks.afterChange.push(async ({ req, doc, operation }) => {
            if (operation !== "create") {
                return;
            }
            if (!finalConfig.privateKey || !finalConfig.publicKey) {
                throw new Error("Private or public API key is not set");
            }
            await importPageHook(finalConfig.privateKey, finalConfig.publicKey, doc.handle);
        });

        if (!enabled) {
            return incomingConfig;
        }

        return incomingConfig;
    };
