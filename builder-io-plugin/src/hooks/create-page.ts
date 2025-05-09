export const createPageHook = async (privateApiKey: string, pageName: string) => {
    const modelName = "page";
    const urlPath = `/${pageName}`;

    try {
        const response = await fetch(`https://builder.io/api/v1/write/${modelName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${privateApiKey}`,
            },
            body: JSON.stringify({
                name: pageName,
                model: modelName,
                published: true,
                data: {
                    url: urlPath,
                },
                query: [
                    {
                        property: "urlPath",
                        operator: "is",
                        value: urlPath,
                    },
                ],
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`Empty page "${pageName}" created successfully.`);
        } else {
            console.error("Failed to create page:", result);
        }
    } catch (error) {
        console.error("Error creating empty page:", error);
    }
};
