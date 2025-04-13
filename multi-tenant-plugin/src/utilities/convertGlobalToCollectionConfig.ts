// import type {
//     GlobalConfig,
//     CollectionConfig,
//     CollectionAdminOptions,
//     Access,
//     PayloadRequest,
// } from "payload";

// type ConvertOptions = {
//     slugPrefix?: string;
//     adminOverrides?: CollectionAdminOptions;
//     accessOverrids?: CollectionConfig["access"];
//     hooksOverride?: CollectionConfig["hooks"];
// };

// /**
//  * Converts a Global config into a single-entry Collection config.
//  * Intended for use when needing tenant-level overrides or access to collection APIs.
//  */
// export function convertGlobalToCollectionConfig(
//     globalConfig: GlobalConfig,
//     options: ConvertOptions = {},
// ): CollectionConfig {
//     const {
//         slugPrefix = "",
//         adminOverrides = {},
//         accessOverrids = {},
//         hooksOverride = {},
//     } = options;

//     const { slug, access, admin, fields, hooks, versions, endpoints, graphQL } = globalConfig;

//     const collectionSlug = `${slugPrefix}${slug}`;

//     const collection: CollectionConfig = {
//         slug: collectionSlug,
//         admin: {
//             ...admin,
//             ...adminOverrides,
//         },
//         fields: [...fields],
//         access: {
//             ...access,
//             ...accessOverrids,
//         },
//         hooks: {
//             ...hooksOverride,
//         },
//         versions,
//         endpoints,
//         graphQL,
//     };

//     return collection;
// }
