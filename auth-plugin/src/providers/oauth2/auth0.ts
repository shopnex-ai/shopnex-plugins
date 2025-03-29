import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface Auth0AuthConfig extends OAuthBaseProviderConfig {
  domain: string
}

/**
 * Add Auth0 OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/auth0
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/auth0
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {Auth0AuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      Auth0AuthProvider({
 *          client_id: process.env.AUTH0_CLIENT_ID as string,
 *          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
 *          domain: process.env.AUTH0_DOMAIN as string,
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
 *      Auth0AuthProvider({
 *          client_id: process.env.AUTH0_CLIENT_ID as string,
 *          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
 *          domain: process.env.AUTH0_DOMAIN as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function Auth0AuthProvider(config: Auth0AuthConfig): OAuth2ProviderConfig {
  const { domain, ...restConfig } = config
  const authorization_server: oauth.AuthorizationServer = {
    issuer: `https://${domain}/`,
    authorization_endpoint: `https://${domain}/authorize`,
    token_endpoint: `https://${domain}/oauth/token`,
    userinfo_endpoint: `https://${domain}/userinfo`,
  }

  return {
    ...restConfig,
    id: "auth0",
    scope: "openid email profile",
    authorization_server,
    name: "Auth0",
    algorithm: "oauth2",
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

export default Auth0AuthProvider
