import type { AccountInfo, OIDCProviderConfig } from "../../types.js"

type AppleAuthConfig = {
  client_id: string
  params?: Record<string, string>
}

/**
 * Add Apple OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/apple
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/apple
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {AppleOIDCAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      AppleOIDCAuthProvider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
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
 *      AppleOIDCAuthProvider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function AppleOIDCAuthProvider(config: AppleAuthConfig): OIDCProviderConfig {
  return {
    ...config,
    id: "apple",
    scope: "openid name email",
    issuer: "https://appleid.apple.com",
    name: "Apple",
    algorithm: "oidc",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default AppleOIDCAuthProvider
