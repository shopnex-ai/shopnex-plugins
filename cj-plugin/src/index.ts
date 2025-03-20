import type { CollectionConfig, Config } from 'payload'

import { CjSettings } from './cj-settings'
import { setCurrentAccessToken } from './sdk/access-token'
import { createOrderHook } from './service/create-order.hook'

interface PluginOptions {
  cjApiKey: string
  cjEmailAddress: string
  cjRefreshToken?: string
}

const updateCollection = (collection: CollectionConfig) => {
  if (collection.slug === 'orders') {
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [...(collection.hooks?.afterChange || []), createOrderHook],
      },
    }
  }
  return collection
}

export const cjPlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const updatedCollections = config.collections?.map(updateCollection)

    setCurrentAccessToken({
      emailAddress: pluginOptions.cjEmailAddress,
      password: pluginOptions.cjApiKey,
      refreshToken: pluginOptions.cjRefreshToken,
    })

    return {
      ...config,
      collections: updatedCollections,
      globals: [...(config.globals || []), CjSettings],
    }
  }
