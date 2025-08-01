import { Config, formatLabels } from "payload";
import { QuickAction } from "../types";
import { defaultActions as getDefaultActions } from "../default-actions";
import { JSX } from "react";

interface BuildActionsParams {
    config: Config;
    iconMap: Record<string, JSX.Element>;
    defaultCreateActions: boolean;
    enableDefaultActions: boolean;
    excludeCollections: string[];
    excludeGlobals: string[];
}

export const buildActions = ({
    config,
    iconMap,
    defaultCreateActions,
    enableDefaultActions,
    excludeCollections,
    excludeGlobals
}: BuildActionsParams): QuickAction[] => {
    const collections = config.collections || [];
    const globals = config.globals || [];
    const actions: QuickAction[] = [];
    const createActions: QuickAction[] = [];
    const adminRoute = config.routes?.admin || "/admin";
    
    // Build collection actions
    for (const collection of collections) {
        if (collection.admin?.hidden || excludeCollections.includes(collection.slug)) {
            continue;
        }
        
        const { plural, singular } = formatLabels(collection.slug);

        actions.push({
            id: `${collection.slug}-quick-actions`,
            name: plural,
            icon: iconMap[collection.slug],
            keywords: `${collection.slug} ${plural}`,
            link: `${adminRoute}/collections/${collection.slug}`,
            priority: 80,
            group: "collections"
        });
        
        if (defaultCreateActions) {
            createActions.push({
                id: `${collection.slug}-quick-actions-create`,
                name: `Create ${singular}`,
                icon: iconMap[collection.slug],
                keywords: `create ${collection.slug} ${singular}`,
                link: `${adminRoute}/collections/${collection.slug}/create`,
                priority: 20,
                group: "create"
            });
        }
    }

    // Build global actions
    for (const global of globals) {
        if (global.admin?.hidden || excludeGlobals.includes(global.slug)) {
            continue;
        }
        
        const { plural } = formatLabels(global.slug);
        actions.push({
            id: `${global.slug}-quick-actions`,
            name: plural,
            icon: iconMap[global.slug],
            keywords: `${global.slug} ${plural}`,
            link: `${adminRoute}/globals/${global.slug}`,
            priority: 80,
            group: "globals"
        });
    }
    
    const defaultActions = enableDefaultActions ? getDefaultActions({ adminRoute }) : [];
    return [...defaultActions, ...actions, ...createActions];
};
