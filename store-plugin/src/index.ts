import type { CollectionSlug, Config } from 'payload'

import { stripePlugin } from '@payloadcms/plugin-stripe'
import { cjPlugin } from '@shoplyjs/cj-plugin'

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

    if (pluginOptions.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          collection.fields.push({
            name: 'addedByPlugin',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
          })
        }
      }
    }

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

    config.plugins?.push(
      cjPlugin({
        cjApiKey: process.env.CJ_API_KEY || '',
        cjEmailAddress: process.env.CJ_EMAIL_ADDRESS || '',
      }),
    )

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      const plugins = [
        { name: 'stripe-plugin', displayName: 'Stripe', plugin: stripePlugin, shortName: 'stripe' },
        { name: 'cj-plugin', displayName: 'CJ Dropshipping', plugin: undefined, shortName: 'cj' },
      ]

      for (const { name: pluginName, displayName } of plugins) {
        const { totalDocs } = await payload.count({
          collection: 'plugins-store',
          where: {
            pluginName: {
              equals: pluginName,
            },
          },
        })

        if (totalDocs === 0) {
          await payload.create({
            collection: 'plugins-store',
            data: {
              displayName,
              pluginName,
              pluginVersion: '1.0.0',
            },
          })
        }
      }
    }

    return config
  }
