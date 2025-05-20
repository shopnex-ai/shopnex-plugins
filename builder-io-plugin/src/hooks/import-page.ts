import { SOURCE_BUILDER_IO_PUBLIC_KEY } from "../constants";
import { builder } from "@builder.io/sdk";
import { createAdminApiClient } from "@builder.io/admin-sdk";
import { modelSchema } from "./schema";

export const importPageHook = async (
    privateApiKey: string,
    publicApiKey: string,
    pageName: string
) => {
    const apiKey = SOURCE_BUILDER_IO_PUBLIC_KEY;
    const modelName = "page";

    try {
        const exists = await checkIfPageExists(pageName, publicApiKey);
        if (exists) {
            console.log(
                `Page "${pageName}" already exists in destination. Skipping import.`
            );
            return;
        }

        builder.init(apiKey);
        const data = await builder.get(modelName, {
            userAttributes: {
                urlPath: "/" + pageName,
            },
        });

        if (data?.data?.url) {
            await importPage(modelName, privateApiKey, data);
        } else {
            console.log(`Page "${pageName}" not found in source.`);
        }
    } catch (error) {
        console.error("Error fetching or importing content:", error);
    }
};

export const importSymbolsInit = async (privateApiKey: string) => {
    const sourceApiKey = SOURCE_BUILDER_IO_PUBLIC_KEY;
    const modelName = "symbol";
    builder.init(sourceApiKey);

    const allSymbols = await builder.getAll(modelName, {
        userAttributes: {
            urlPath: "/",
        },
        limit: 100,
    });

    await createSymbolModel({ privateKey: privateApiKey });

    for (const symbolData of allSymbols) {
        await importPage(modelName, privateApiKey, symbolData);
    }
};

async function checkIfPageExists(
    pageName: string,
    publicApiKey: string
): Promise<boolean> {
    try {
        builder.init(publicApiKey);
        const data = await builder.get("page", {
            userAttributes: {
                urlPath: "/" + pageName,
            },
        });

        if (data?.data?.url) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error checking if page exists:", error);
        return false;
    }
}

async function importPage(
    modelName: string,
    privateApiKey: string,
    pageContent: any
) {
    try {
        const response = await fetch(
            `https://builder.io/api/v1/write/${modelName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${privateApiKey}`,
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
            console.log(`Successfully imported page: ${pageContent.name}`);
        } else {
            console.error("Error importing page:", result);
        }
    } catch (error) {
        console.error("Error during page import:", error);
    }
}

async function createEmptyPage(
    modelName: string,
    privateApiKey: string,
    pageName: string
) {
    try {
        const response = await fetch(
            `https://builder.io/api/v1/write/${modelName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${privateApiKey}`,
                },
                body: JSON.stringify({
                    data: {
                        url: pageName,
                    },
                    name: pageName,
                    model: modelName,
                    published: true,
                }),
            }
        );

        const result = await response.json();

        if (response.ok) {
            console.log(`Successfully created empty page: ${pageName}`);
        } else {
            console.error("Error creating empty page:", result);
        }
    } catch (error) {
        console.error("Error during empty page creation:", error);
    }
}

async function createSymbolModel({ privateKey }: { privateKey: string }) {
    const adminSDK = createAdminApiClient(privateKey);

    try {
        const model = await adminSDK.chain.mutation
            .addModel({ body: modelSchema })
            .execute({ id: true });

        if (!model) {
            console.error("Failed to create symbol model.");
            return;
        }

        console.log("Symbol model created:", model.id);
    } catch (error) {
        console.error("Error creating symbol model:", error);
    }
}
