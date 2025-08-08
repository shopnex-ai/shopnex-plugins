import type { RichTextCustomElement } from "../../../types";

const name = "h1";

export const h1: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H1ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading1Element",
};
