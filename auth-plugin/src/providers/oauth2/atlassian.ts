import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const algorithm = "oauth2"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://auth.atlassian.com",
  authorization_endpoint: "https://auth.atlassian.com/authorize",
  token_endpoint: "https://auth.atlassian.com/oauth/token",
  userinfo_endpoint: "https://api.atlassian.com/me",
}

type AtlassianAuthConfig = OAuthBaseProviderConfig

/**
 * Add Atlassian OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/atlassian
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/atlassian
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {AtlassianAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      AtlassianAuthProvider({
 *          client_id: process.env.ATLASSIAN_CLIENT_ID as string,
 *          client_secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 *  // For App
 *  appAuthPlugin({
 *    name: 'app'
 *    secret: process.env.APP_AUTH_SECRET,
 *    accountsCollectionSlug: 'adminAccounts',
 *    usersCollectionSlug: 'appUsers',
 *    accountsCollectionSlug: 'appAccounts',
 *    providers:[
 *      AtlassianAuthProvider({
 *          client_id: process.env.ATLASSIAN_CLIENT_ID as string,
 *          client_secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function AtlassianAuthProvider(
  config: AtlassianAuthConfig,
): OAuth2ProviderConfig {
  return {
    ...config,
    id: "atlassian",
    authorization_server,
    name: "Atlassian",
    algorithm,
    scope: "read:me read:account",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.account_id as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default AtlassianAuthProvider
