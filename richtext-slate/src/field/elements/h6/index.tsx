import type { RichTextCustomElement } from "../../../types";

const name = "h6";

export const h6: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H6ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading6Element",
};
