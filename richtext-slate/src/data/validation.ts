import type { RichTextField, Validate } from "payload";

import type { AdapterArguments } from "../types";

import { defaultRichTextValue } from "./defaultValue";

export const richTextValidate: Validate<
    unknown[],
    unknown,
    RichTextField<any[], AdapterArguments>,
    RichTextField<any[], AdapterArguments>
> = (value, { req, required }) => {
    const { t } = req;
    if (required) {
        const stringifiedDefaultValue = JSON.stringify(defaultRichTextValue);
        if (value && JSON.stringify(value) !== stringifiedDefaultValue) {
            return true;
        }
        return t("validation:required");
    }

    return true;
};
