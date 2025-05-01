import * as cjSdk from "./cj-sdk";

type Credentials = {
    emailAddress: string;
    password: string;
    refreshToken?: string;
};

const tenantCredentialsMap = new Map<string, Credentials>();

export const getCurrentAccessToken = async () => {
    const shopId = "1";
    const accessToken = await getTenantAccessToken(shopId);
    return accessToken;
};

export const setTenantCredentials = (shopId: string, creds: Credentials) => {
    tenantCredentialsMap.set(shopId, creds);
};

export const getTenantAccessToken = async (shopId: string) => {
    const creds = tenantCredentialsMap.get(shopId) || {
        emailAddress: process.env.CJ_EMAIL_ADDRESS || "",
        password: process.env.CJ_PASSWORD || "",
        refreshToken: process.env.CJ_REFRESH_TOKEN || "",
    };

    if (!creds?.emailAddress || !creds?.password) {
        throw new Error(`Credentials for tenant ${shopId} are missing or incomplete`);
    }

    const { emailAddress, password, refreshToken } = creds;

    let newAccessToken: string;
    let newRefreshToken: string | undefined;

    if (!refreshToken) {
        const result = await cjSdk.getAccessToken(emailAddress, password);
        newAccessToken = result.accessToken;
        newRefreshToken = result.refreshToken;
    } else {
        const result = await cjSdk.refreshAccessToken(refreshToken);
        newAccessToken = result.accessToken;
        newRefreshToken = result.refreshToken;
    }

    tenantCredentialsMap.set(shopId, {
        ...creds,
        refreshToken: newRefreshToken,
    });

    return newAccessToken;
};
