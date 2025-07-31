import { Config, formatLabels } from "payload";
import { QuickAction } from "../types";
import { defaultActions as getDefaultActions } from "../default-actions";
import { JSX } from "react";

export const buildActions = (
    config: Config,
    iconMap: Record<string, JSX.Element>,
    defaultCreateActions: boolean
) => {
    const collections = config.collections || [];
    const globals = config.globals || [];
    const actions: QuickAction[] = [];
    const createActions: QuickAction[] = [];
    const adminRoute = config.routes?.admin || "/admin";
    for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        if (collection.admin?.hidden) continue;
        const { plural, singular } = formatLabels(collection.slug);

        actions.push({
            id: `${collection.slug}-quick-actions`,
            name: plural,
            icon: iconMap[collection.slug] || undefined,
            keywords: `${collection.slug}-quick-actions`,
            link: `${adminRoute}/collections/${collection.slug}`,
            priority: 80,
        });
        if (defaultCreateActions) {
            createActions.push({
                id: `${collection.slug}-quick-actions-create`,
                name: `Create ${singular}`,
                icon: iconMap[collection.slug] || undefined,
                keywords: `${collection.slug}-quick-actions-create`,
                link: `${adminRoute}/collections/${collection.slug}/create`,
                priority: 20,
            });
        }
    }

    for (let i = 0; i < globals.length; i++) {
        const global = globals[i];
        if (global.admin?.hidden) continue;
        const { plural } = formatLabels(global.slug);
        actions.push({
            id: `${global.slug}-quick-actions`,
            name: plural,
            icon: iconMap[global.slug] || undefined,
            keywords: `${global.slug}-quick-actions`,
            link: `${adminRoute}/globals/${global.slug}`,
            priority: 80,
        });
    }
    return [...getDefaultActions({ adminRoute }), ...actions, ...createActions];
};
