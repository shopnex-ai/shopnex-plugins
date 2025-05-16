import { asyncHandlebars } from './asyncHandlebars'

export const replacePlaceholders = (prompt: string, values: object) => {
  return asyncHandlebars.compile(prompt, { trackIds: true })(values) as Promise<string>
}
