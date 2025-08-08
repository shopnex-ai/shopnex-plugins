import type { Editor } from "slate";

import { useAddClientFunction } from "@payloadcms/ui";

import { useSlateProps } from "./SlatePropsProvider";

type Plugin = (editor: Editor) => Editor;

export const useSlatePlugin = (key: string, plugin: Plugin) => {
    const { schemaPath } = useSlateProps();

    useAddClientFunction(`slatePlugin.${schemaPath}.${key}`, plugin);
};
