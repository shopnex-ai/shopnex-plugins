import { SOURCE_BUILDER_IO_PUBLIC_KEY } from "../constants";
import { builder } from "@builder.io/sdk";

export const importPageHook = async (
    privateApiKey: string,
    publicApiKey: string,
    pageName: string,
) => {
    const apiKey = SOURCE_BUILDER_IO_PUBLIC_KEY;
    const modelName = "page";

    try {
        builder.init(apiKey);
        const exists = await checkIfPageExists(publicApiKey, modelName, pageName);
        if (exists) {
            console.log(`Page "${pageName}" already exists in destination. Skipping import.`);
            return;
        }

        const data = await builder.get("page", {
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

async function checkIfPageExists(
    apiKey: string,
    modelName: string,
    pageName: string,
): Promise<boolean> {
    try {
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

async function importPage(modelName: string, privateApiKey: string, pageContent: any) {
    try {
        const response = await fetch(`https://builder.io/api/v1/write/${modelName}`, {
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
                query: [
                    {
                        property: "urlPath",
                        operator: "is",
                        value: pageContent.data.url,
                    },
                ],
            }),
        });

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
