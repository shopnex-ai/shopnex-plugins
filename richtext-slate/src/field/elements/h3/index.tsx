import type { RichTextCustomElement } from "../../../types";

const name = "h3";

export const h3: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H3ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading3Element",
};
