import type { RichTextCustomLeaf } from "../../../types";

export const strikethrough: RichTextCustomLeaf = {
    name: "strikethrough",
    Button: "@shopnex/richtext-tiptap/client#StrikethroughLeafButton",
    Leaf: "@shopnex/richtext-tiptap/client#StrikethroughLeaf",
};
