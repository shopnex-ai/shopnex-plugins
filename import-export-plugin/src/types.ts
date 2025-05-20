import type {
    CollectionAdminOptions,
    CollectionConfig,
    UploadConfig,
} from "payload";

export type CollectionOverride = {
    admin: CollectionAdminOptions;
    upload: UploadConfig;
} & CollectionConfig;

type ImportColumn = {
    name: string;
    /**
     * The key of the field in the collection
     * @example variants[0].gallery[0].url
     */
    key: string;
    data_type?: "string" | "number" | "datetime" | "boolean";
    required?: boolean;
    description: string;
    suggested_mappings: string[];
};

export type ImportExportPluginConfig = {
    /**
     * Collections to include the Import/Export controls in
     * Defaults to all collections
     */
    collections?: string[];
    /**
     * Collections to include in the import collection
     */
    importCollections?: {
        collectionSlug: string;
        columns?: ImportColumn[];
    }[];
    /**
     * Enable to force the export to run synchronously
     */
    disableJobsQueue?: boolean;
    /**
     * This function takes the default export collection configured in the plugin and allows you to override it by modifying and returning it
     * @param collection
     * @returns collection
     */
    overrideExportCollection?: (
        collection: CollectionOverride
    ) => CollectionOverride;
};
