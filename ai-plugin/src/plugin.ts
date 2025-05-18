import type { Config } from 'payload'

import { deepMerge } from 'payload/shared'

import type { PluginConfig } from './types'

import { defaultGenerationModels } from './ai/models/index'
import { lexicalJsonSchema } from './ai/schemas/lexicalJsonSchema'
import { instructionsCollection } from './collections/Instructions'
import { PLUGIN_NAME } from './defaults'
import { fetchFields } from './endpoints/fetchFields'
import { endpoints } from './endpoints/index'
import { init } from './init'
import { translations } from './translations/index'
import { getGenerationModels } from './utilities/getGenerationModels'
import { isPluginActivated } from './utilities/isPluginActivated'
import { updateFieldsConfig } from './utilities/updateFieldsConfig'

const defaultPluginConfig: PluginConfig = {
  collections: {},
  disableSponsorMessage: false,
  generatePromptOnInit: true,
  generationModels: defaultGenerationModels,
}

const payloadAiPlugin =
  (pluginConfig: PluginConfig) =>
  (incomingConfig: Config): Config => {
    pluginConfig = { ...defaultPluginConfig, ...pluginConfig }
    pluginConfig.generationModels = getGenerationModels(pluginConfig)
    const isActivated = isPluginActivated(pluginConfig)
    let updatedConfig: Config = { ...incomingConfig }
    let collectionsFieldPathMap = {}
    if (isActivated) {
      const Instructions = instructionsCollection(pluginConfig)
      // Inject editor schema to config, so that it can be accessed when /textarea endpoint will hit
      const lexicalSchema = lexicalJsonSchema(pluginConfig.editorConfig?.nodes)

      if (pluginConfig.debugging) {
        Instructions.admin.hidden = false
      }

      Instructions.admin.custom = {
        ...(Instructions.admin.custom || {}),
        [PLUGIN_NAME]: {
          editorConfig: {
            // Used in admin client for useObject hook
            schema: lexicalSchema,
          },
        },
      }

      const collections = [...(incomingConfig.collections ?? []), Instructions]
      const { collections: collectionSlugs = [] } = pluginConfig

      const { components: { providers = [] } = {} } = incomingConfig.admin || {}
      const updatedProviders = [
        ...(providers ?? []),
        {
          path: '@ai-stack/payloadcms/client#InstructionsProvider',
        },
      ]

      incomingConfig.admin = {
        ...(incomingConfig.admin || {}),
        components: {
          ...(incomingConfig.admin?.components ?? {}),
          providers: updatedProviders,
        },
      }

      const pluginEndpoints = endpoints(pluginConfig)
      updatedConfig = {
        ...incomingConfig,
        collections: collections.map((collection) => {
          if (collectionSlugs[collection.slug]) {
            const { schemaPathMap, updatedCollectionConfig } = updateFieldsConfig(collection)
            collectionsFieldPathMap = {
              ...collectionsFieldPathMap,
              ...schemaPathMap,
            }
            return updatedCollectionConfig
          }

          return collection
        }),
        endpoints: [
          ...(incomingConfig.endpoints ?? []),
          pluginEndpoints.textarea,
          pluginEndpoints.upload,
          fetchFields(pluginConfig.access),
        ],
        i18n: {
          ...(incomingConfig.i18n || {}),
          translations: {
            ...deepMerge(translations, incomingConfig.i18n?.translations ?? {}),
          },
        },
      }
    }

    updatedConfig.onInit = async (payload) => {
      if (incomingConfig.onInit) await incomingConfig.onInit(payload)

      if (!isActivated) {
        payload.logger.warn(`— AI Plugin: Not activated. Please verify your environment keys.`)
        return
      }

      await init(payload, collectionsFieldPathMap, pluginConfig).catch((error) => {
        console.error(error)
        payload.logger.error(`— AI Plugin: Initialization Error: ${error}`)
      })
    }

    return updatedConfig
  }

export { payloadAiPlugin }
