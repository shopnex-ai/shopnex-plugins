import type { RichTextCustomElement } from "../../../types";

import { indentType } from "./shared";

export const indent: RichTextCustomElement = {
    name: indentType,
    Button: "@shopnex/richtext-tiptap/client#IndentButton",
    Element: "@shopnex/richtext-tiptap/client#IndentElement",
};
