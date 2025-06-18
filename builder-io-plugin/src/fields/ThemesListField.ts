import { Field } from "payload";

export const ThemesListField: Field = {
    // label: "Most Popular and Free",
    // type: "group",
    // admin: {
    //     description:
    //         "Explore top-rated free themes loved by store owners—designed to help you launch quickly and look great.",
    //     condition: (data, _, { operation }) => {
    //         if (!data?.editorMode?.length) {
    //             return false;
    //         }
    //         const isBuilderIoBlock = !!data?.editorMode?.some(
    //             (type: any) => type.blockType === "builder-io"
    //         );
    //         const isKeysDefined = data?.editorMode?.some(
    //             (type: any) =>
    //                 type.builderIoPublicKey && type.builderIoPrivateKey
    //         );
    //         return isBuilderIoBlock && isKeysDefined;
    //     },
    // },
    // fields: [
    //     {
    //     ],
    // },
    name: "builderIoThemes",
    type: "ui",
    label: "",
    admin: {
        components: {
            Field: "@shopnex/builder-io-plugin/rsc#ThemeList",
        },
        condition: (data, _, { operation }) => {
            if (!data?.editorMode?.length) {
                return false;
            }
            const isBuilderIoBlock = !!data?.editorMode?.some(
                (type: any) => type.blockType === "builder-io"
            );
            // const isKeysDefined = data?.editorMode?.some(
            //     (type: any) =>
            //         type.builderIoPublicKey && type.builderIoPrivateKey
            // );
            return isBuilderIoBlock;
        },
    },
};
