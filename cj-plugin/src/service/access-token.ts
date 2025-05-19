import { CjData } from "../cj-settings";
import { getAccessToken, refreshAccessToken } from "../sdk/auth";

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const TOKEN_EXPIRY = {
    ACCESS: 15 * ONE_DAY_MS, // 15 days
    REFRESH: 180 * ONE_DAY_MS, // 180 days
};

const isTokenExpiring = async (expiryDate: string | Date): Promise<boolean> => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + ONE_HOUR_MS);
    const expiryDateTime = new Date(expiryDate);
    return expiryDateTime.getTime() < oneHourFromNow.getTime();
};

const updateTokenData = (
    data: Partial<CjData>,
    tokenResponse: TokenResponse
): void => {
    const now = new Date().getTime();

    data.accessToken = tokenResponse.accessToken;
    data.refreshToken = tokenResponse.refreshToken;
    data.accessTokenExpiry = new Date(now + TOKEN_EXPIRY.ACCESS);
    data.refreshTokenExpiry = new Date(now + TOKEN_EXPIRY.REFRESH);
};

const validateCredentials = (
    apiToken: string | undefined,
    email: string | undefined
): void => {
    if (!apiToken || !email) {
        throw new Error("Missing API token or email address");
    }
};

const handleRefreshToken = async (
    data: Partial<CjData>,
    refreshToken: string
): Promise<string> => {
    const refreshedTokens = await refreshAccessToken(refreshToken);
    updateTokenData(data, refreshedTokens);
    return refreshedTokens.accessToken;
};

const getNewTokens = async (
    data: Partial<CjData>,
    email: string,
    apiToken: string
): Promise<string> => {
    const newTokens = await getAccessToken(email, apiToken);
    updateTokenData(data, newTokens);
    return newTokens.accessToken;
};

export const retrieveAccessToken = async (
    data: Partial<CjData>
): Promise<string> => {
    const apiToken = data.apiToken || process.env.CJ_API_TOKEN;
    const email = data.emailAddress || process.env.CJ_EMAIL_ADDRESS;

    validateCredentials(apiToken, email);

    const { accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry } =
        data;

    // Check if current access token is valid
    if (
        accessToken &&
        accessTokenExpiry &&
        !(await isTokenExpiring(accessTokenExpiry))
    ) {
        return accessToken;
    }

    // Try refresh token if available
    if (
        refreshToken &&
        refreshTokenExpiry &&
        !(await isTokenExpiring(refreshTokenExpiry))
    ) {
        return handleRefreshToken(data, refreshToken);
    }

    // Get new tokens if everything is expired or missing
    return getNewTokens(data, email!, apiToken!);
};
