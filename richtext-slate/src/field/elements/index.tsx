import type { RichTextCustomElement } from "../../types";

import { blockquote } from "./blockquote/index";
import { h1 } from "./h1/index";
import { h2 } from "./h2/index";
import { h3 } from "./h3/index";
import { h4 } from "./h4/index";
import { h5 } from "./h5/index";
import { h6 } from "./h6/index";
import { indent } from "./indent/index";
import { li } from "./li/index";
import { link } from "./link/index";
import { ol } from "./ol/index";
import { relationship } from "./relationship/index";
import { textAlign } from "./textAlign/index";
import { ul } from "./ul/index";
import { upload } from "./upload/index";

export const elements: Record<string, RichTextCustomElement> = {
    blockquote,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    indent,
    li,
    link,
    ol,
    relationship,
    textAlign,
    ul,
    upload,
};
