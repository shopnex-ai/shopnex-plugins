import type { RichTextCustomElement } from "../../../types";

export const link: RichTextCustomElement = {
    name: "link",
    Button: "@shopnex/richtext-tiptap/client#LinkButton",
    Element: "@shopnex/richtext-tiptap/client#LinkElement",
    plugins: ["@shopnex/richtext-tiptap/client#WithLinks"],
};
