import { QuickActionsPluginConfig } from "../types";

export const validateConfig = (config: QuickActionsPluginConfig): QuickActionsPluginConfig => {
    const validatedConfig = { ...config };

    if (validatedConfig.position && !["actions", "before-nav-links", "after-nav-links"].includes(validatedConfig.position)) {
        console.warn(`Invalid position "${validatedConfig.position}". Defaulting to "actions".`);
        validatedConfig.position = "actions";
    }

    if (validatedConfig.overrideActions && validatedConfig.customActionBuilder) {
        console.warn("Both overrideActions and customActionBuilder provided. overrideActions will take precedence.");
    }

    if (validatedConfig.excludeCollections && !Array.isArray(validatedConfig.excludeCollections)) {
        console.warn("excludeCollections must be an array. Resetting to empty array.");
        validatedConfig.excludeCollections = [];
    }

    if (validatedConfig.excludeGlobals && !Array.isArray(validatedConfig.excludeGlobals)) {
        console.warn("excludeGlobals must be an array. Resetting to empty array.");
        validatedConfig.excludeGlobals = [];
    }

    return validatedConfig;
};