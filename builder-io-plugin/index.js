import { builder } from "@builder.io/sdk";

(async () => {
    const apiKey = "954fa25aa9f845c0ad6a82b2b52c6abd";
    const modelName = "page";
    const pageName = "cart";
    const destinationApiKey = "bpk-69e5f63d1e684ca1a8562fbebcd2b4d4";
    try {
        // const response = await fetch(
        //     `https://cdn.builder.io/api/v3/content/${modelName}?apiKey=${apiKey}&query.name=${encodeURIComponent(pageName)}&enrich=true`,
        // );

        // const data = await response.json();

        builder.init(apiKey);
        const data = await builder.get("page", {
            userAttributes: {
                urlPath: "/" + pageName,
            },
        });

        if (data) {
            await importPage(modelName, destinationApiKey, data);
            // You can store this JSON data for import later
        } else {
            console.log(`Page "${pageName}" not found.`);
        }
    } catch (error) {
        console.error("Error fetching content:", error);
    }
})();

async function importPage(modelName, privateApiKey, pageContent) {
    try {
        pageContent.data = {
            ...pageContent.data,
            page: {
                url: pageContent.title,
            },
        };
        const response = await fetch(
            `https://builder.io/api/v1/write/${modelName}`, // NOTE: Different endpoint for private API
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${privateApiKey}`, // PRIVATE API key here
                },
                body: JSON.stringify({
                    data: pageContent.data,

                    name: pageContent.name,
                    model: modelName,
                    published: pageContent.published || true, // Publish it right away (or you can set to false)
                    query: [
                        {
                            property: "urlPath",
                            operator: "is",
                            value: pageContent.data.url, // Make sure this starts with "/"
                        },
                    ],
                }),
            },
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
