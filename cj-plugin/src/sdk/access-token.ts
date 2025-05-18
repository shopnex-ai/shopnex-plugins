import { getAccessToken, refreshAccessToken } from "./auth";

type Credentials = {
    emailAddress: string;
    password: string;
    refreshToken?: string;
    accessToken?: string;
};

const tenantCredentialsMap = new Map<string, Credentials>();

export const getCurrentAccessToken = async () => {
    const shopId = "1";
    const accessToken = await getTenantAccessToken(shopId);
    return accessToken;
};

export const setTenantCredentials = (
    shopId: string,
    credentials: Credentials
) => {
    tenantCredentialsMap.set(shopId, credentials);
};

export const getTenantAccessToken = async (shopId: string) => {
    const credentials = tenantCredentialsMap.get(shopId) || {
        emailAddress: process.env.CJ_EMAIL_ADDRESS || "",
        password: process.env.CJ_PASSWORD || "",
        refreshToken: process.env.CJ_REFRESH_TOKEN || "",
    };

    if (credentials.accessToken) {
        return credentials.accessToken;
    }

    if (!credentials?.emailAddress || !credentials?.password) {
        throw new Error(
            `Credentials for tenant ${shopId} are missing or incomplete`
        );
    }

    const { emailAddress, password, refreshToken } = credentials;

    let newAccessToken: string;
    let newRefreshToken: string | undefined;

    if (!refreshToken) {
        const result = await getAccessToken(emailAddress, password);
        newAccessToken = result.accessToken;
        newRefreshToken = result.refreshToken;
    } else {
        const result = await refreshAccessToken(refreshToken);
        newAccessToken = result.accessToken;
        newRefreshToken = result.refreshToken;
    }

    tenantCredentialsMap.set(shopId, {
        ...credentials,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    });

    return newAccessToken;
};
