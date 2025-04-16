# @shopnex/import-export-plugin

A flexible plugin for Payload CMS to enable Import/Export functionality on your collections.

## ✨ Features

- Add **Import** and **Export** controls to any collection
- Define **custom column mappings** for importing
- Override export collection behavior
- Toggle **synchronous export** (no job queue)

---

## 🔧 Installation

```bash
npm install @shopnex/import-export-plugin
```

---

## 🚀 Basic Usage

Add the plugin to your Payload config:

```ts
import { importExportPlugin } from "@shopnex/import-export-plugin";

export default buildConfig({
  plugins: [
    importExportPlugin({
      collections: ["products", "orders"],
      importCollections: [
        { collectionSlug: "products" },
        { collectionSlug: "orders" },
      ],
      disableJobsQueue: true,
    }),
  ],
});
```

---

## ⚙️ Plugin Options

```ts
type ImportExportPluginConfig = {
  collections?: string[];
  importCollections?: {
    collectionSlug: string;
    columns?: ImportColumn[];
  }[];
  disableJobsQueue?: boolean;
  overrideExportCollection?: (collection: CollectionOverride) => CollectionOverride;
};
```

### `collections`

Specify which collections should have the **Import/Export** controls in the admin UI.

### `importCollections`

Define which collections support **data import**, and optionally configure custom column mapping using the `columns` field.

### `disableJobsQueue`

When `true`, export runs **synchronously** instead of using the background jobs queue. Useful for quick exports or environments without job workers.

### `overrideExportCollection`

Hook to **customize the exported data schema** per collection.

---

## 📦 ImportColumn Format

Use `ImportColumn` to describe each column for import in a collection:

```ts
type ImportColumn = {
  name: string; // Label shown to the user
  key: string; // Field path in the collection
  data_type?: "string" | "number" | "datetime" | "boolean";
  required?: boolean;
  description: string;
  suggested_mappings: string[]; // Helpful auto-mapping hints
};
```

### 🧪 Example:

```ts
importExportPlugin({
  importCollections: [
    {
      collectionSlug: "products",
      columns: [
        {
          name: "Product Title",
          key: "title",
          data_type: "string",
          required: true,
          description: "The name of the product",
          suggested_mappings: ["title", "name", "product_title"],
        },
        {
          name: "Price",
          key: "price",
          data_type: "number",
          description: "Product price in USD",
          suggested_mappings: ["price", "cost"],
        },
        {
          name: "Gallery Image URL",
          key: "variants[0].gallery[0].url",
          data_type: "string",
          description: "URL of the main product image",
          suggested_mappings: ["image", "image_url", "photo"],
        },
      ],
    },
  ],
});
```

---

## 🛠 Requirements

- Payload CMS v2+

---

## 📃 License

MIT – © 2025 [ShopNex](https://github.com/shopnex)

---

Let me know if you'd like help with:
- Auto-generating docs from types
- A badge or banner
- Deploying this as a public plugin on NPM or GitHub Marketplace

Happy to help polish it!