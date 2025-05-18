import { BasePayload, Payload } from "payload";

const refreshAccessToken = async () => {};

const updateAccessToken = async () => {};

const ensureTokenValidity = async (expiredAt: Date) => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const isExpired = expiredAt.getTime() < oneHourFromNow.getTime();

    return isExpired;
};

export const getAccessToken = async ({ payload }: { payload: BasePayload }) => {
    const data = await payload.find({
        collection: "cj-settings",
        where: {
            shop: {
                equals: "1",
            },
        },
        limit: 1,
    });

    const result = data.docs[0];

    if (!result) {
        return "";
    }

    return result.accessToken;
};
