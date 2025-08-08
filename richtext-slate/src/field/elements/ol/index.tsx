import type { RichTextCustomElement } from "../../../types";

const name = "ol";

export const ol: RichTextCustomElement = {
    name,
    Button: {
        clientProps: {
            format: name,
        },
        path: "@shopnex/richtext-tiptap/client#OLElementButton",
    },
    Element: "@shopnex/richtext-tiptap/client#OrderedListElement",
};
