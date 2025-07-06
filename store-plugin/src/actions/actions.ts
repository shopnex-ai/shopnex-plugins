"use server";

import { cookies } from "next/headers";

export const getPluginSpace = async (queryString: string) => {
    const response = await fetch(
        `https://app.shopnex.ai/api/products${queryString}`,
        {
            headers: {
                "x-shop-handle": "plugins",
            },
        }
    );
    const data = await response.json();
    return data;
};

export const getPlugin = async (pluginId: string) => {
    const response = await fetch(
        `https://app.shopnex.ai/api/products/${pluginId}`,
        {
            headers: {
                "x-shop-handle": "plugins",
            },
        }
    );
    const data = await response.json();
    return data;
};
