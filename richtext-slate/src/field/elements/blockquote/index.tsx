import type { RichTextCustomElement } from "../../../types";

const name = "blockquote";

export const blockquote: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#BlockquoteElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#BlockquoteElement",
};
