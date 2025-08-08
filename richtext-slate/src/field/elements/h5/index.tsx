import type { RichTextCustomElement } from "../../../types";

const name = "h5";

export const h5: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H5ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading5Element",
};
