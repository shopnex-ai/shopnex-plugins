import * as process from 'node:process'

import type { GenerationModel } from '../../types'

import { AnthropicConfig } from './anthropic/index'
import { ElevenLabsConfig } from './elevenLabs/index'
import { OpenAIConfig } from './openai/index'

export const defaultGenerationModels: GenerationModel[] = [
  ...(process.env.OPENAI_API_KEY ? OpenAIConfig.models : []),
  ...(process.env.ANTHROPIC_API_KEY ? AnthropicConfig.models : []),
  ...(process.env.ELEVENLABS_API_KEY ? ElevenLabsConfig.models : []),
]
