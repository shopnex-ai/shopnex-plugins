import type { RichTextCustomElement } from "../../../types";

import { uploadName } from "./shared";

export const upload: RichTextCustomElement = {
    name: uploadName,
    Button: "@shopnex/richtext-tiptap/client#UploadElementButton",
    Element: "@shopnex/richtext-tiptap/client#UploadElement",
    plugins: ["@shopnex/richtext-tiptap/client#WithUpload"],
};
