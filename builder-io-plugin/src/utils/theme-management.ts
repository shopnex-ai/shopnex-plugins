import { createAdminApiClient } from "@builder.io/admin-sdk";
import { builder } from "@builder.io/sdk";
import { getModelSchema } from "./schema";

const createModel = async ({
    privateKey,
    modelName,
}: {
    privateKey: string;
    modelName: string;
}) => {
    const adminSDK = createAdminApiClient(privateKey);
    const themeModel = getModelSchema({ name: modelName, subType: "page" });
    const model = await adminSDK.chain.mutation
        .addModel({ body: themeModel })
        .execute({ id: true });
    return model;
};

const isModelExists = async ({
    privateKey,
    modelName,
}: {
    privateKey: string;
    modelName: string;
}) => {
    const adminSDK = createAdminApiClient(privateKey);
    const models = await adminSDK.query({
        models: {
            id: true,
            fields: true,
            name: true,
        },
    });
    if (!models.data || !models.data.models) {
        return false;
    }
    const themeModelExists = models.data?.models.some(
        (model) => model.name === modelName
    );
    return themeModelExists;
};

async function importThemePage(
    modelName: string,
    privateKey: string,
    pageContent: any,
    logger: any
) {
    try {
        logger.debug("Importing page", {
            modelName,
            pageName: pageContent.name,
        });

        const response = await fetch(
            `https://builder.io/api/v1/write/${modelName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${privateKey}`,
                },
                body: JSON.stringify({
                    data: pageContent.data,
                    name: pageContent.name,
                    model: modelName,
                    published: pageContent.published ?? true,
                    query: pageContent.data?.url
                        ? [
                              {
                                  property: "urlPath",
                                  operator: "is",
                                  value: pageContent.data.url,
                              },
                          ]
                        : [],
                }),
            }
        );

        const result = await response.json();

        if (response.ok) {
            logger.info("Successfully imported theme page", {
                modelName,
                pageName: pageContent.name,
            });
            return result;
        } else {
            logger.error("Error importing theme page", {
                modelName,
                pageName: pageContent.name,
                error: result,
            });
            return null;
        }
    } catch (error) {
        logger.error("Error during theme page import", {
            error,
            modelName,
            pageName: pageContent.name,
        });
        return null;
    }
}

const fetchPages = async ({
    publicKey,
    themeName,
}: {
    publicKey: string;
    themeName: string;
}) => {
    try {
        const pages = await builder.getAll(themeName, {
            userAttributes: {
                urlPath: "/",
            },
            limit: 100,
            apiKey: publicKey,
            options: {
                noTargeting: true,
            },
        });
        return pages;
    } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
    }
};

export const uploadTheme = async ({
    privateKey,
    themeName,
    sourcePublicKey,
    logger,
}: {
    privateKey: string;
    themeName: string;
    sourcePublicKey: string;
    logger: any;
}) => {
    try {
        logger.debug("Starting theme upload process", { themeName });

        const themeModelExists = await isModelExists({
            privateKey,
            modelName: themeName,
        });
        logger.debug("Theme model existence checked", {
            themeName,
            exists: themeModelExists,
        });

        if (!themeModelExists) {
            logger.info("Creating new theme model", { themeName });
            await createModel({
                privateKey,
                modelName: themeName,
            });
        }

        const symbolModelExists = await isModelExists({
            privateKey,
            modelName: "symbol",
        });
        logger.debug("Symbol model existence checked", {
            themeName: "symbol",
            exists: symbolModelExists,
        });

        if (!symbolModelExists) {
            logger.info("Creating new symbol model", { themeName: "symbol" });
            await createModel({
                privateKey,
                modelName: "symbol",
            });
        }

        logger.debug("Fetching pages for theme", { themeName });
        const [pages, symbols] = await Promise.all([
            fetchPages({
                publicKey: sourcePublicKey,
                themeName,
            }),
            fetchPages({
                publicKey: sourcePublicKey,
                themeName: "symbol",
            }),
        ]);
        logger.info("Retrieved theme content", {
            themeName,
            pageCount: pages.length,
            symbolCount: symbols.length,
        });

        const symbolImportPromises = symbols.map((symbol) => {
            logger.debug("Importing symbol", {
                themeName,
                symbolName: symbol.name,
            });
            return importThemePage("symbol", privateKey, symbol, logger);
        });

        await Promise.all(symbolImportPromises);
        logger.info("Symbols import completed", {
            symbolCount: symbols.length,
        });

        const pageImportPromises = pages.map((page) => {
            logger.debug("Importing theme page", {
                themeName,
                pageName: page.name,
            });
            return importThemePage(themeName, privateKey, page, logger);
        });

        await Promise.all(pageImportPromises);
        logger.info("Theme upload completed successfully", { themeName });

        return true;
    } catch (error) {
        logger.error("Error uploading theme", { error, themeName });
        return false;
    }
};
