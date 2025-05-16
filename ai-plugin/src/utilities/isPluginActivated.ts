import type { PluginConfig } from '../types'

import { getGenerationModels } from './getGenerationModels'

export const isPluginActivated = (pluginConfig: PluginConfig) => {
  return getGenerationModels(pluginConfig).length > 0
}
