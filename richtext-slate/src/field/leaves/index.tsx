import type { RichTextCustomLeaf } from "../../types";

import { bold } from "./bold/index";
import { code } from "./code/index";
import { italic } from "./italic/index";
import { strikethrough } from "./strikethrough/index";
import { underline } from "./underline/index";

export const defaultLeaves: Record<string, RichTextCustomLeaf> = {
    bold,
    code,
    italic,
    strikethrough,
    underline,
};
