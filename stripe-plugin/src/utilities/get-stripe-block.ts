import { Payment } from "@shopnex/types";
import { PayloadRequest, PaginatedDocs } from "payload";

export const getStripeBlock = async ({
    req,
    shopId,
}: {
    req: PayloadRequest;
    shopId: number;
}) => {
    const paymentsDocument = (await req.payload.find({
        collection: "payments",
        where: {
            shop: {
                equals: shopId,
            },
        },
    })) as PaginatedDocs<Payment>;

    const stripeBlock = paymentsDocument.docs[0]?.providers?.find(
        (provider: any) => provider.blockType === "stripe"
    );
    if (stripeBlock?.blockType === "stripe") {
        return stripeBlock;
    }
};
