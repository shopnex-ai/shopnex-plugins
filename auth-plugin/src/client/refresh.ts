import { AuthPluginOutput } from "../types"

interface BaseOptions {
  name: string
}
export const refresh = async (
  options: BaseOptions,
): Promise<AuthPluginOutput> => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL
  const response = await fetch(`${base}/api/${options.name}/session/refresh`)
  const { message, kind, data, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    message,
    kind,
    data,
    isError,
    isSuccess,
  }
}
