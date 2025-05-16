import { defaultGenerationModels } from '../ai/models/index'
import { PluginConfig } from '../types'

export function getGenerationModels(pluginConfig: PluginConfig) {
  const { generationModels } = pluginConfig
  if (typeof generationModels === 'function') {
    return generationModels(defaultGenerationModels)
  }
  if (Array.isArray(generationModels)) {
    return generationModels
  }
  if (generationModels === undefined) {
    return defaultGenerationModels
  }
  return generationModels
}
