import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://www.facebook.com",
  authorization_endpoint: "https://www.facebook.com/v19.0/dialog/oauth",
  token_endpoint: "https://graph.facebook.com/oauth/access_token",
  userinfo_endpoint:
    "https://graph.facebook.com/me?fields=id,name,email,picture",
}

type FacebookAuthConfig = OAuthBaseProviderConfig

/**
 * Add Facebook OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/facebook
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/facebook
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {FacebookAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      FacebookAuthProvider({
 *          client_id: process.env.FACEBOOK_CLIENT_ID as string,
 *          client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
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
 *      FacebookAuthProvider({
 *          client_id: process.env.FACEBOOK_CLIENT_ID as string,
 *          client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function FacebookAuthProvider(
  config: FacebookAuthConfig,
): OAuth2ProviderConfig {
  return {
    ...config,
    id: "facebook",
    scope: "email",
    authorization_server,
    name: "Facebook",
    algorithm: "oauth2",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      let picture

      if (typeof profile.picture === "object" && profile.picture !== null) {
        // Type assertion
        const dataContainer = profile.picture as { data: { url: string } }
        if ("data" in dataContainer) {
          picture = dataContainer.data.url
        }
      }
      return {
        sub: profile.id as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: picture as string,
      }
    },
  }
}

export default FacebookAuthProvider
