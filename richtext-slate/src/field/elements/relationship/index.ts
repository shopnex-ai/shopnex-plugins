import type { RichTextCustomElement } from "../../../types";

import { relationshipName } from "./shared";

export const relationship: RichTextCustomElement = {
    name: relationshipName,
    Button: "@shopnex/richtext-tiptap/client#RelationshipButton",
    Element: "@shopnex/richtext-tiptap/client#RelationshipElement",
    plugins: ["@shopnex/richtext-tiptap/client#WithRelationship"],
};
