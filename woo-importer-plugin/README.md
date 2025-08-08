# Quick Actions Plugin for Payload CMS

<img width="1238" height="655" alt="image" src="https://github.com/user-attachments/assets/5c84d549-d983-45a1-abd1-3da747ec1a24" />

A powerful and extensible command palette plugin for Payload CMS that provides instant access to collections, globals, and custom actions through a searchable interface.

## ✨ Features

- ⚡ **Instant Access** – Quick search and navigation to any collection or global
- 🎨 **Customizable** – Full control over actions, icons, and positioning
- 🔧 **Extensible** – Plugin hooks, custom action builders, and filtering
- 🎯 **Type Safe** – Full TypeScript support with comprehensive type definitions
- 🚀 **Performance** – Optimized rendering and minimal bundle impact
- 🔍 **Fuzzy Search** – Search for actions with fuzzy matching

## 🚀 Installation

```bash
npm install @shopnex/quick-actions-plugin
# or
pnpm add @shopnex/quick-actions-plugin
```

## 🛠️ Basic Usage

```ts
import { quickActionsPlugin } from "@shopnex/quick-actions-plugin";

export default buildConfig({
    plugins: [
        quickActionsPlugin({
            position: "actions", // 'actions' | 'before-nav-links' | 'after-nav-links'
            defaultCreateActions: true,
        }),
        // ... other plugins
    ],
    // ... rest of config
});
```

## 🔧 Advanced Configuration

### Custom Actions

```ts
import { quickActionsPlugin, QuickActionBuilder } from '@shopnex/quick-actions-plugin';
import { Settings, Users } from 'lucide-react';

const customActions = [
  QuickActionBuilder
    .create('settings', 'System Settings')
    .withIcon(<Settings size={16} />)
    .withLink('/admin/settings')
    .withKeywords('config system settings')
    .withGroup('admin')
    .build(),

  QuickActionBuilder
    .create('users-export', 'Export Users')
    .withIcon(<Users size={16} />)
    .withLink('/admin/collections/users/export')
    .withPriority(10)
    .build()
];

export default buildConfig({
  plugins: [
    quickActionsPlugin({
      additionalActions: customActions,
      excludeCollections: ['sensitive-data'],
    }),
  ],
});
```

### Plugin Hooks

```ts
quickActionsPlugin({
    hooks: {
        beforeActionsGenerated: (config) => {
            console.log("Generating actions for config:", config);
        },
        afterActionsGenerated: (actions) => {
            return actions.filter((action) => !action.name.includes("test"));
        },
        onActionExecute: async (action) => {
            console.log("Executing action:", action.name);
            // Custom analytics or logging
        },
    },
});
```

### Custom Action Builder

```ts
quickActionsPlugin({
    customActionBuilder: (config) => {
        const actions = [];

        // Custom logic to generate actions based on config
        config.collections?.forEach((collection) => {
            if (collection.admin?.useAsTitle) {
                actions.push({
                    id: `search-${collection.slug}`,
                    name: `Search ${collection.slug}`,
                    link: `/admin/collections/${collection.slug}?search=`,
                    priority: 90,
                });
            }
        });

        return actions;
    },
});
```

### Action Filtering and Utilities

```ts
import {
    filterActions,
    sortActionsByPriority,
    groupActionsByCategory,
} from "@shopnex/quick-actions-plugin";

// Filter actions by criteria
const filteredActions = filterActions(actions, {
    byGroup: "collections",
    byPriority: 50,
    excludeGroups: ["admin"],
});

// Sort by priority
const sortedActions = sortActionsByPriority(actions);

// Group by category
const groupedActions = groupActionsByCategory(actions);
```

### Custom Icons

```ts
import { quickActionsPlugin } from '@shopnex/quick-actions-plugin';
import { Database, FileText, Image } from 'lucide-react';

quickActionsPlugin({
  overrideIconsMap: {
    posts: <FileText size={16} />,
    media: <Image size={16} />,
    categories: <Database size={16} />
  }
});
```

## ⌨️ Keyboard Shortcuts

- **Cmd/Ctrl + K** - Open command palette
- **Arrow Keys** - Navigate actions
- **Enter** - Execute selected action
- **Escape** - Close command palette

## 🎨 Styling

The plugin includes default SCSS styles that can be customized:

```scss
.CommandBar {
    // Custom styles for the command bar
}

.quick-actions {
    // Custom styles for the trigger button
}
```

## 📚 API Reference

### QuickActionsPluginConfig

```ts
interface QuickActionsPluginConfig {
    position?: "actions" | "before-nav-links" | "after-nav-links";
    overrideActions?: QuickAction[];
    additionalActions?: QuickAction[];
    overrideIconsMap?: Record<string, JSX.Element>;
    defaultCreateActions?: boolean;
    kbarOptions?: KBarOptions;
    hooks?: PluginHooks;
    enableDefaultActions?: boolean;
    customActionBuilder?: (config: any) => QuickAction[];
    excludeCollections?: string[];
    excludeGlobals?: string[];
}
```

### QuickAction Interface

```ts
interface QuickAction {
    id: ActionId;
    name: string;
    shortcut?: string[];
    keywords?: string;
    section?: ActionSection;
    icon?: string | React.ReactElement | React.ReactNode;
    subtitle?: string;
    perform?: (currentActionImpl: ActionImpl) => any;
    parent?: ActionId;
    priority?: Priority;
    link?: string;
    group?: string;
    custom?: boolean;
}
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main repository.

## 📄 License

MIT – © 2025 ShopNex.ai
