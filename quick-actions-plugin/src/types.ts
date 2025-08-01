import { KBarOptions } from "kbar";

import { Command } from "kbar/lib/action/Command";
import { JSX } from "react";

/**
 * Represents a quick action that can be triggered in the UI.
 */
/**
 * Represents a single action that can be executed via the command palette or other interfaces.
 *
 * @example
 * const action: QuickAction = {
 *   id: "create-post",
 *   name: "Create Post",
 *   shortcut: ["c", "p"],
 *   keywords: "new post article",
 *   perform: () => navigate("/admin/posts/create"),
 *   icon: <PlusIcon />,
 *   group: "Content",
 * };
 */
export interface QuickAction {
    /**
     * Optional link to navigate to when the action is executed.
     *
     * @example
     * link: "/admin/dashboard"
     */
    link?: string;

    /**
     * Optional group name to categorize the action.
     *
     * @example
     * group: "Content"
     */
    group?: string;

    /**
     * Marks whether the action is custom-defined.
     *
     * @example
     * custom: true
     */
    custom?: boolean;

    /**
     * Unique identifier for the action.
     *
     * @example
     * id: "create-post"
     */
    id: string;

    /**
     * Display name of the action.
     *
     * @example
     * name: "Create Post"
     */
    name: string;

    /**
     * Keyboard shortcut to trigger the action.
     *
     * @example
     * shortcut: ["c", "p"]
     */
    shortcut?: string[];

    /**
     * Searchable keywords for the action.
     *
     * @example
     * keywords: "new create post blog article"
     */
    keywords?: string;

    /**
     * Section or category for UI grouping.
     *
     * @example
     * section: "Posts"
     *
     * @example
     * section: { name: "Admin", priority: 1 }
     */
    section?:
        | string
        | {
              name: string;
              priority: number;
          };

    /**
     * Icon displayed alongside the action name.
     *
     * @example
     * icon: <PlusIcon />
     */
    icon?: string | React.ReactElement | React.ReactNode;

    /**
     * Optional subtitle to show below the action name.
     *
     * @example
     * subtitle: "Quickly add a new blog post"
     */
    subtitle?: string;

    /**
     * Function executed when the action is triggered.
     *
     * @example
     * perform: () => navigate("/posts/new")
     */
    perform?: (currentActionImpl: ActionImpl) => any;

    /**
     * Optional ID of the parent action if this is a sub-action.
     *
     * @example
     * parent: "posts"
     */
    parent?: string;

    /**
     * Optional priority to influence sorting (higher = earlier).
     *
     * @example
     * priority: 10
     */
    priority?: number;
}

/**
 * Internal representation of a QuickAction with parent-child hierarchy and runtime metadata.
 *
 * @example
 * const impl: ActionImpl = {
 *   id: "create-post",
 *   name: "Create Post",
 *   shortcut: ["c", "p"],
 *   keywords: "create post",
 *   section: "Posts",
 *   icon: <PlusIcon />,
 *   subtitle: "Create a new post",
 *   perform: () => console.log("Post created"),
 *   priority: 1,
 *   command: someCommand,
 *   ancestors: [],
 *   children: [],
 *   addChild(child) { this.children.push(child); },
 *   removeChild(child) { this.children = this.children.filter(c => c.id !== child.id); },
 *   get parentActionImpl() { return someParent; }
 * };
 */
export interface ActionImpl extends QuickAction {
    id: QuickAction["id"];
    name: QuickAction["name"];
    shortcut: QuickAction["shortcut"];
    keywords: QuickAction["keywords"];
    section: QuickAction["section"];
    icon: QuickAction["icon"];
    subtitle: QuickAction["subtitle"];
    parent?: QuickAction["parent"];

    /**
     * Executes the action.
     * @deprecated Use QuickAction.perform instead.
     */
    perform: QuickAction["perform"];

    /**
     * Associated command metadata.
     */
    command?: Command;

    /**
     * List of ancestor actions in the hierarchy.
     */
    ancestors: ActionImpl[];

    /**
     * List of children actions under this action.
     */
    children: ActionImpl[];

    /**
     * Adds a child action to the current one.
     *
     * @param childActionImpl - The action to add as a child.
     */
    addChild(childActionImpl: ActionImpl): void;

    /**
     * Removes a child action from the current one.
     *
     * @param actionImpl - The action to remove.
     */
    removeChild(actionImpl: ActionImpl): void;

    /**
     * The parent action instance, if one exists.
     */
    get parentActionImpl(): ActionImpl;
}

/**
 * Hook callbacks that can be triggered during the quick actions lifecycle.
 */
export interface PluginHooks {
    /**
     * Called before generating quick actions. Can be used to customize config.
     * @param config - Configuration object passed to the plugin.
     */
    beforeActionsGenerated?: (config: any) => void;

    /**
     * Called after actions are generated, allowing modifications or filtering.
     * @param actions - List of generated quick actions.
     * @returns Modified list of quick actions.
     */
    afterActionsGenerated?: (actions: QuickAction[]) => QuickAction[];

    /**
     * Called when an action is executed.
     * @param action - The executed quick action.
     */
    onActionExecute?: (action: QuickAction) => void | Promise<void>;
}

/**
 * Configuration for the Quick Actions plugin.
 */
export interface QuickActionsPluginConfig {
    /**
     * Determines where to place the quick actions in the UI.
     * - "actions": In the actions section.
     * - "before-nav-links": Before navigation links.
     * - "after-nav-links": After navigation links.
     */
    position?: "actions" | "before-nav-links" | "after-nav-links";

    /**
     * Replaces the default actions with the provided list.
     */
    overrideActions?: QuickAction[];

    /**
     * Adds additional actions on top of the defaults.
     */
    additionalActions?: QuickAction[];

    /**
     * Overrides the default icon map with custom JSX elements.
     */
    overrideIconsMap?: Record<string, JSX.Element>;

    /**
     * Enables generation of default create actions (e.g. "Create X").
     */
    defaultCreateActions?: boolean;

    /**
     * Passes custom KBar configuration options.
     */
    kbarOptions?: KBarOptions;

    /**
     * Custom lifecycle hooks to modify plugin behavior.
     */
    hooks?: PluginHooks;

    /**
     * Enables the default actions such as navigating to the dashboard or content.
     */
    enableDefaultActions?: boolean;

    /**
     * Function to build custom actions based on the plugin config.
     * @param config - The plugin configuration object.
     * @returns A list of custom quick actions.
     */
    customActionBuilder?: (config: any) => QuickAction[];

    /**
     * Controls how actions are grouped in the UI.
     * - "type": Group by type.
     * - "priority": Group by priority.
     * - "custom": Group by custom flag.
     * - false: No grouping.
     */
    groupBy?: "type" | "priority" | "custom" | false;

    /**
     * List of collection slugs to exclude from quick actions.
     */
    excludeCollections?: string[];

    /**
     * List of global slugs to exclude from quick actions.
     */
    excludeGlobals?: string[];
}
