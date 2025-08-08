# Payload Slate Rich Text Editor

Slate Rich Text Editor for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @shopnex/richtext-tiptap
```

## Usage

```ts
import { buildConfig } from "payload";
import { slateEditor } from "@shopnex/richtext-tiptap";

export default buildConfig({
    editor: slateEditor({}),
    // ...rest of config
});
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/configuration/overview).
