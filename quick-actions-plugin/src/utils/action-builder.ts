import { QuickAction } from "../types";

export interface ActionBuilder {
    id: string;
    name: string;
    icon?: React.ReactElement;
    keywords?: string;
    link?: string;
    priority?: number;
    group?: string;
    subtitle?: string;
    custom?: boolean;
}

export class QuickActionBuilder {
    private action: Partial<QuickAction> = {};

    constructor(id: string, name: string) {
        this.action.id = id;
        this.action.name = name;
    }

    static create(id: string, name: string): QuickActionBuilder {
        return new QuickActionBuilder(id, name);
    }

    withIcon(icon: React.ReactElement): QuickActionBuilder {
        this.action.icon = icon;
        return this;
    }

    withLink(link: string): QuickActionBuilder {
        this.action.link = link;
        return this;
    }

    withKeywords(keywords: string): QuickActionBuilder {
        this.action.keywords = keywords;
        return this;
    }

    withPriority(priority: number): QuickActionBuilder {
        this.action.priority = priority;
        return this;
    }

    withGroup(group: string): QuickActionBuilder {
        this.action.group = group;
        return this;
    }

    withSubtitle(subtitle: string): QuickActionBuilder {
        this.action.subtitle = subtitle;
        return this;
    }

    asCustom(): QuickActionBuilder {
        this.action.custom = true;
        return this;
    }

    build(): QuickAction {
        if (!this.action.id || !this.action.name) {
            throw new Error("Action must have both id and name");
        }
        
        return {
            ...this.action,
            priority: this.action.priority ?? 50,
            keywords: this.action.keywords ?? this.action.name
        } as QuickAction;
    }
}

export const createAction = (config: ActionBuilder): QuickAction => {
    const builder = QuickActionBuilder.create(config.id, config.name);
    
    if (config.icon) {
        builder.withIcon(config.icon);
    }
    if (config.link) {
        builder.withLink(config.link);
    }
    if (config.keywords) {
        builder.withKeywords(config.keywords);
    }
    if (config.priority !== undefined) {
        builder.withPriority(config.priority);
    }
    if (config.group) {
        builder.withGroup(config.group);
    }
    if (config.subtitle) {
        builder.withSubtitle(config.subtitle);
    }
    
    return builder.build();
};