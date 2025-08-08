import type { RichTextCustomElement } from "../../../types";

const name = "h4";

export const h4: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#H4ElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#Heading4Element",
};
