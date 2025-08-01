import { QuickAction } from "../types";

export interface ActionFilter {
    byGroup?: string;
    byPriority?: number;
    byKeyword?: string;
    customOnly?: boolean;
    excludeGroups?: string[];
}

export const filterActions = (actions: QuickAction[], filter: ActionFilter): QuickAction[] => {
    return actions.filter(action => {
        if (filter.byGroup && action.group !== filter.byGroup) {
            return false;
        }

        if (filter.byPriority && (action.priority || 50) < filter.byPriority) {
            return false;
        }

        if (filter.byKeyword) {
            const keyword = filter.byKeyword.toLowerCase();
            const matchesName = action.name.toLowerCase().includes(keyword);
            const matchesKeywords = action.keywords?.toLowerCase().includes(keyword);
            const matchesSubtitle = action.subtitle?.toLowerCase().includes(keyword);
            
            if (!matchesName && !matchesKeywords && !matchesSubtitle) {
                return false;
            }
        }

        if (filter.customOnly && !action.custom) {
            return false;
        }

        if (filter.excludeGroups && action.group && filter.excludeGroups.includes(action.group)) {
            return false;
        }

        return true;
    });
};

export const sortActionsByPriority = (actions: QuickAction[]): QuickAction[] => {
    return [...actions].sort((a, b) => (b.priority || 50) - (a.priority || 50));
};

export const groupActionsByCategory = (actions: QuickAction[]): Record<string, QuickAction[]> => {
    return actions.reduce((groups, action) => {
        const group = action.group || "default";
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(action);
        return groups;
    }, {} as Record<string, QuickAction[]>);
};