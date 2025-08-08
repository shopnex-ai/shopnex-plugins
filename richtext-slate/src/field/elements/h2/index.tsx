import type { RichTextCustomElement } from "../../../types";

const name = "h2";

export const h2: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H2ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading2Element",
};
