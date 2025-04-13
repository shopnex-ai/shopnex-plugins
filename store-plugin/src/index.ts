import type { CollectionSlug, Config } from 'payload'
import { PluginStore } from './plugin-store'

export type StorePluginConfig = {
  cjConfig?: undefined
  collections?: Partial<Record<CollectionSlug, true>>
  disabled?: boolean
}

export const storePlugin =
  (pluginOptions: StorePluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(PluginStore)


    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    return config
  }
