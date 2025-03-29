import { AuthPluginOutput, ErrorKind } from "../types"

type BaseOptions = {
  name: string
}

export type OauthProvider =
  | "google"
  | "github"
  | "apple"
  | "cognito"
  | "gitlab"
  | "msft-entra"
  | "slack"
  | "atlassian"
  | "auth0"
  | "discord"
  | "facebook"
  | "jumpcloud"
  | "twitch"

export const oauth = (
  options: BaseOptions,
  provider: OauthProvider,
): Promise<AuthPluginOutput> => {
  return new Promise((resolve) => {
    const channelId = `oauth_channel_${Math.random().toString(36).substring(2, 15)}`
    const channel = new BroadcastChannel(channelId)

    const defaultOutput: AuthPluginOutput = {
      message: "Failed to authenticate",
      kind: ErrorKind.BadRequest,
      data: null,
      isSuccess: false,
      isError: true,
    }

    const base = process.env.NEXT_PUBLIC_SERVER_URL
    const authUrl = `${base}/api/${options.name}/oauth/authorization/${provider}?clientOrigin=${encodeURIComponent(window.location.origin + `#${channelId}`)}`

    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      authUrl,
      "oauth",
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    // Listen for messages
    channel.onmessage = (event) => {
      channel.close()
      if (popup && !popup.closed) popup.close()
      clearTimeout(timeoutId)
      resolve(event.data as AuthPluginOutput)
    }

    const timeoutId = setTimeout(() => {
      if (!popup || popup.closed) {
        channel.close()
        resolve(defaultOutput)
      } else {
        const checkInterval = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkInterval)
            channel.close()
            resolve(defaultOutput)
          }
        }, 1000)

        setTimeout(() => {
          clearInterval(checkInterval)
          channel.close()
          if (popup && !popup.closed) popup.close()
          resolve(defaultOutput)
        }, 120000)
      }
    }, 1000)
  })
}
