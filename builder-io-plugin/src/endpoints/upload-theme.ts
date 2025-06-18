import { createAdminApiClient } from "@builder.io/admin-sdk";
import { getModelSchema } from "./schema";
import { PayloadHandler } from "payload";

const createThemeModel = async ({
    privateKey,
    themeName,
}: {
    privateKey: string;
    themeName: string;
}) => {
    const adminSDK = createAdminApiClient(privateKey);
    const themeModel = getModelSchema({ name: themeName, subType: "page" });
    const model = await adminSDK.chain.mutation
        .addModel({ body: themeModel })
        .execute({ id: true });
    return model;
};

const isThemeModelExists = async ({
    privateKey,
    themeName,
}: {
    privateKey: string;
    themeName: string;
}) => {
    const adminSDK = createAdminApiClient(privateKey);
    const models = await adminSDK.query({
        models: {
            id: true,
            fields: true,
            name: true,
        },
    });
    if (!models.data || !models.data.models) {
        return false;
    }
    const symbolModelExists = models.data?.models.some(
        (model) => model.name === themeName
    );
    return symbolModelExists;
};

export const uploadTheme = async ({ privateKey, themeName }: any) => {
    await createThemeModel({
        privateKey,
        themeName,
    });
};

export const uploadThemeHandler: PayloadHandler = async (req) => {
    const body = (await req.json?.()) as { themeName: string };
    const themeId = req.routeParams?.themeId;
    const isSuperAdmin = req.user?.roles?.includes("super-admin");
    if (!req.user?.shops?.length) {
        return Response.json({ status: 400, error: "User not found" });
    }
    if (!body.themeName) {
        return Response.json({
            status: 400,
            error: "Theme name is required",
        });
    }

    debugger;
    const theme = await req.payload.find({
        collection: "themes",
        where: {
            id: {
                equals: themeId,
            },
            ...(!isSuperAdmin && {
                shop: {
                    equals: (req.user.shops[0]?.shop as any)?.id,
                },
            }),
        },
    });
    const result = theme.docs[0];
    // await uploadTheme({
    //     privateKey: process.env.BUILDER_IO_PRIVATE_KEY,
    //     themeName: body.themeName,
    // });
    return Response.json({ success: true });
};
