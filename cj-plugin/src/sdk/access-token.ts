import * as cjSdk from "./cj-sdk";

type Credentials = {
    emailAddress: string;
    password: string;
    refreshToken?: string;
};

const tenantCredentialsMap = new Map<string, Credentials>();

export const getCurrentAccessToken = async () => {
    const shopId = '1'
    const accessToken = await getTenantAccessToken(shopId);
    return accessToken
};

export const setTenantCredentials = (shopId: string, creds: Credentials) => {
    tenantCredentialsMap.set(shopId, creds);
};

export const getTenantAccessToken = async (shopId: string) => {
    const creds = tenantCredentialsMap.get(shopId);

    if (!creds?.emailAddress || !creds?.password) {
        throw new Error(`Credentials for tenant ${shopId} are missing or incomplete`);
    }

    const { emailAddress, password, refreshToken } = creds;
    let accessToken = (await cjSdk.refreshAccessToken(refreshToken || "")).accessToken;
    if (!accessToken) {
        accessToken = (await cjSdk.getAccessToken(emailAddress, password)).accessToken;
    }
    return accessToken;
};
