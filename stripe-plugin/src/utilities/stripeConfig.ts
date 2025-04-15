// import { cookies } from "next/headers";

type Credentials = {
    secretKey: string;
    webhooksEndpointSecret?: string;
    publishableKey?: string;
};

const tenantCredentialsMap = new Map<string, Credentials>();

export const getCurrentAccessToken = async () => {
    // const shopId = (await cookies()).get("shopId")?.value;

    // if (!shopId) {
    //     throw new Error("No shopId cookie found");
    // }

    // const accessToken = await getTenantSecretKey(shopId);
    // return accessToken;
};

export const setTenantCredentials = (shopId: string, creds: Credentials) => {
    tenantCredentialsMap.set(shopId, creds);
};

export const getTenantSecretKey = async (shopId: string) => {
    const creds = tenantCredentialsMap.get(shopId);

    if (!creds) {
        throw new Error(`No credentials found for shopId: ${shopId}`);
    }

    return creds.secretKey;
};

export const getTenantWebhookSecret = (shopId: string) => {
    const creds = tenantCredentialsMap.get(shopId);
    return creds?.webhooksEndpointSecret;
};

export const getTenantPublishableKey = (shopId: string) => {
    const creds = tenantCredentialsMap.get(shopId);
    return creds?.publishableKey;
};
