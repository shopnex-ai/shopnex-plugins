import { PayloadHandler } from "payload";
import { uploadTheme } from "../utils/theme-management";

export const uploadThemeHandler: PayloadHandler = async (req) => {
    const { logger } = req.payload;
    const body = (await req.json?.()) as { themeName: string };
    const themeId = req.routeParams?.themeId;
    const isSuperAdmin = req.user?.roles?.includes("super-admin");

    logger.debug("Upload theme request received", {
        themeName: body.themeName,
        themeId,
        isSuperAdmin,
    });

    if (!req.user?.shops?.length) {
        logger.warn("Upload theme attempt without associated shops", {
            userId: req.user?.id,
        });
        return Response.json({ error: "User not found" }, { status: 400 });
    }

    if (!body.themeName) {
        logger.warn("Upload theme attempt without theme name");
        return Response.json({
            error: "Theme name is required",
            status: 400,
        });
    }

    try {
        logger.debug("Fetching theme details", { themeId });
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
        if (!result) {
            logger.warn("Theme not found", { themeId });
            return Response.json({ error: "Theme not found" }, { status: 404 });
        }

        const themeMode = result.editorMode[0];
        logger.info("Starting theme upload process", {
            themeName: body.themeName,
            themeId,
        });

        const success = await uploadTheme({
            // @ts-ignore
            privateKey: themeMode.builderIoPrivateKey,
            themeName: body.themeName,
            sourcePublicKey: process.env
                .NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY as string,
            logger,
        });

        if (success) {
            logger.info("Theme upload completed successfully", {
                themeName: body.themeName,
            });
            return Response.json({ success: true });
        } else {
            logger.error("Theme upload failed", { themeName: body.themeName });
            return Response.json(
                { error: "Failed to upload theme" },
                { status: 500 }
            );
        }
    } catch (error) {
        logger.error("Error in upload theme handler", {
            error,
            themeName: body.themeName,
        });
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
