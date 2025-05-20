"use server";

export const getPluginSpace = async (queryString: string) => {
    const response = await fetch(
        `https://app.shopnex.ai/api/products${queryString}`
    );
    const data = await response.json();
    return data;
};

export const getPlugin = async (pluginId: string) => {
    const response = await fetch(
        `https://app.shopnex.ai/api/products/${pluginId}`
    );
    const data = await response.json();
    return data;
};
