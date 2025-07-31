Here's a professional and well-structured `README.md` for your Payload SDK:

---

# Payload SDK

A fully type-safe SDK for interacting with the Payload CMS REST API. This package simplifies working with Payload by offering a seamless, strongly typed developer experience—closely mirroring the Local API interface.

## ✨ Features

- 🔒 **Full Type Safety** – powered by your generated Payload types.
- 🔁 **Support for all core operations** – including collections, globals, auth, versions, and file uploads.
- 🔍 **Query filters & population** – type-safe `where`, `select`, and `populate` support.
- 📁 **File uploads** – simplified with native `Blob`, `File`, or URL input.
- 🧩 **Custom endpoints** – easy access to non-standard REST routes.
- ⚙️ **Custom fetch and request config** – extend or replace fetch logic and share common options.

## 🚀 Installation

```bash
npm install @payloadcms/sdk
# or
pnpm add @payloadcms/sdk
```

## 🛠️ Usage

```ts
import { PayloadSDK } from "@payloadcms/sdk";
import type { Config } from "./payload-types";

const sdk = new PayloadSDK<Config>({
    baseURL: "https://example.com/api",
});
```

### ✅ Core Operations

#### Find Documents

```ts
const posts = await sdk.find({
    collection: "posts",
    draft: true,
    limit: 10,
    locale: "en",
    page: 1,
    where: { _status: { equals: "published" } },
});
```

#### Find by ID

```ts
const post = await sdk.findByID({
    collection: "posts",
    id,
    draft: true,
    locale: "en",
});
```

#### Count Documents

```ts
const result = await sdk.count({
    collection: "posts",
    where: { id: { equals: post.id } },
});
```

#### Create Document

```ts
const result = await sdk.create({
    collection: "posts",
    data: { text: "hello" },
});
```

#### Create with File Upload

```ts
const result = await sdk.create({
    collection: "media",
    file, // File | Blob | string (URL)
    data: {},
});
```

#### Update Document by ID

```ts
const result = await sdk.update({
    collection: "posts",
    id: post.id,
    data: { text: "updated" },
});
```

#### Bulk Update

```ts
const result = await sdk.update({
    collection: "posts",
    where: { id: { equals: post.id } },
    data: { text: "bulk-updated" },
});
```

#### Delete by ID

```ts
const result = await sdk.delete({
    collection: "posts",
    id: post.id,
});
```

#### Bulk Delete

```ts
const result = await sdk.delete({
    collection: "posts",
    where: { id: { equals: post.id } },
});
```

---

### 🌐 Global Operations

```ts
await sdk.findGlobal({ slug: "global" });
await sdk.updateGlobal({ slug: "global", data: { text: "updated" } });
```

---

### 🔐 Auth Operations

```ts
// Login
await sdk.login({
    collection: "users",
    data: { email: "dev@payloadcms.com", password: "123456" },
});

// Me
await sdk.me(
    { collection: "users" },
    {
        headers: { Authorization: `JWT ${token}` },
    }
);

// Refresh Token
await sdk.refreshToken(
    { collection: "users" },
    {
        headers: { Authorization: `JWT ${token}` },
    }
);

// Forgot Password
await sdk.forgotPassword({
    collection: "users",
    data: { email: "dev@payloadcms.com" },
});

// Reset Password
await sdk.resetPassword({
    collection: "users",
    data: { token, password: "new-password" },
});
```

---

### 🕓 Versions

```ts
await sdk.findVersions({
    collection: "posts",
    where: { parent: { equals: post.id } },
});

await sdk.findVersionByID({
    collection: "posts",
    id: version.id,
});

await sdk.restoreVersion({
    collection: "posts",
    id,
});

// Global Versions
await sdk.findGlobalVersions({ slug: "global" });
await sdk.findGlobalVersionByID({ slug: "global", id: version.id });
await sdk.restoreGlobalVersion({ slug: "global", id });
```

---

### 🧩 Custom Requests

```ts
await sdk.request({
    method: "POST",
    path: "/send-data",
    json: { id: 1 },
});
```

---

### ⚙️ Custom Fetch + Shared Init

```ts
const sdk = new PayloadSDK<Config>({
    baseURL: "https://example.com/api",
    baseInit: {
        credentials: "include",
    },
    fetch: async (url, init) => {
        console.log("Request started");
        const response = await fetch(url, init);
        console.log("Request completed");
        return response;
    },
});
```

---

## 📘 Notes

- All operations support a third optional parameter to customize `fetch` options (headers, etc.).
- Fully compatible with `RequestInit`, enabling cookies, custom headers, CORS config, and more.

---

## 📄 License

MIT – © 2025 Payload CMS contributors

---

Let me know if you'd like me to publish this to npm, generate a `tsdoc` documentation site, or help integrate into your CI/CD!
