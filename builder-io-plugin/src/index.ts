import type { Block, BlocksField, Config } from "payload";
import { importPageHook, importSymbolsInit } from "./hooks/import-page";
import { ThemesListField } from "./fields/ThemesListField";
import { BuilderIoBlock } from "./blocks/builder-io-block";
import { uploadThemeHandler } from "./endpoints/upload-theme";
export { importSymbolsInit } from "./hooks/import-page";

export interface BuilderIoConfig {
    enabled?: boolean;
    publicKey?: string;
    privateKey?: string;
    collectionDesignSlug?: string;
    collectionPagesSlug?: string;
    collectionOverrides?: any;
}

export const defaultConfig: BuilderIoConfig = {
    enabled: true,
    publicKey: process.env.BUILDER_IO_PUBLIC_KEY,
    privateKey: process.env.BUILDER_IO_PRIVATE_KEY,
    collectionDesignSlug: undefined,
    collectionPagesSlug: "pages",
    collectionOverrides: {},
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
            (collection) => collection.slug === finalConfig.collectionPagesSlug
        );

        if (finalConfig.collectionDesignSlug) {
            const designCollection = incomingConfig.collections?.find(
                (collection) =>
                    collection.slug === finalConfig.collectionDesignSlug
            );
            if (!designCollection || typeof designCollection !== "object") {
                throw new Error("Design collection not found");
            }
            designCollection.fields.push(ThemesListField);
            const editorModeField = designCollection.fields.find(
                (field) => (field as any).name === "editorMode"
            ) as BlocksField;
            if (editorModeField) {
                editorModeField.blocks.unshift(BuilderIoBlock);
            }

            if (!designCollection.endpoints) {
                designCollection.endpoints = [];
            }

            designCollection.endpoints.push({
                method: "post",
                path: "/upload-theme/:themeId",
                handler: uploadThemeHandler,
            });
        }

        // TODO: Remove this after we have a proper way to import pages
        // if (!pagesCollection || typeof pagesCollection !== "object") {
        //     throw new Error("Pages collection not found");
        // }

        // if (!pagesCollection.hooks) {
        //     pagesCollection.hooks = {};
        // }

        // if (!Array.isArray(pagesCollection.hooks.afterChange)) {
        //     pagesCollection.hooks.afterChange = [];
        // }

        // pagesCollection.hooks.afterChange.push(async ({ doc, operation }) => {
        //     if (operation !== "create") {
        //         return;
        //     }
        //     if (!finalConfig.privateKey || !finalConfig.publicKey) {
        //         throw new Error("Private or public API key is not set");
        //     }
        //     await importPageHook(
        //         finalConfig.privateKey,
        //         finalConfig.publicKey,
        //         doc.handle
        //     );
        // });

        if (!enabled) {
            return incomingConfig;
        }

        const incomingOnInit = incomingConfig.onInit;

        incomingConfig.onInit = async (payload) => {
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
        };

        return incomingConfig;
    };
