import type {
    CollectionAfterChangeHook,
    CollectionBeforeChangeHook,
    CollectionBeforeOperationHook,
    CollectionConfig,
    Config,
} from "payload";

import type { CollectionOverride, ImportExportPluginConfig } from "./types";

import { createExport } from "./export/createExport";
import { download } from "./export/download";
import { getFields } from "./export/getFields";

export const getExportCollection = ({
    config,
    pluginConfig,
}: {
    config: Config;
    pluginConfig: ImportExportPluginConfig;
}): CollectionConfig => {
    const { overrideExportCollection } = pluginConfig;

    const beforeOperation: CollectionBeforeOperationHook[] = [];
    const afterChange: CollectionAfterChangeHook[] = [];

    let collection: CollectionOverride = {
        slug: "exports",
        access: {
            update: () => false,
        },
        admin: {
            group: false,
            useAsTitle: "name",
        },
        disableDuplicate: true,
        endpoints: [
            {
                handler: download,
                method: "post",
                path: "/download",
            },
        ],
        fields: getFields(config),
        hooks: {
            afterChange,
            beforeOperation,
        },
        upload: {
            filesRequiredOnCreate: false,
            hideFileInputOnCreate: true,
            hideRemoveFile: true,
        },
    };

    if (typeof overrideExportCollection === "function") {
        collection = overrideExportCollection(collection);
    }

    if (pluginConfig.disableJobsQueue) {
        beforeOperation.push(async ({ args, operation, req }) => {
            if (operation !== "create") {
                return;
            }
            const { user } = req;
            await createExport({ input: { ...args.data, user }, req });
        });
    } else {
        afterChange.push(async ({ doc, operation, req }) => {
            if (operation !== "create") {
                return;
            }

            const input = {
                ...doc,
                exportsCollection: collection.slug as any,
                user: req?.user?.id,
                userCollection: "users",
            };
            await req.payload.jobs.queue({
                input: input,
                task: "createCollectionExport",
            } as any);
        });
    }

    return collection;
};
