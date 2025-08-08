import type { RichTextCustomElement } from "../../../types";

const name = "ul";

export const ul: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#ULElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#UnorderedListElement",
};
