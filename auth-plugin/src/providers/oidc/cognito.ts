import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface CognitoAuthConfig extends OAuthBaseProviderConfig {
  domain: string
  region: string
}

/**
 * Add Cognito OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/cognito
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/cognito
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {CognitoAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      CognitoAuthProvider({
 *          client_id: process.env.COGNITO_CLIENT_ID as string,
 *          client_secret: process.env.COGNITO_CLIENT_SECRET as string,
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
 *      CognitoAuthProvider({
 *          client_id: process.env.COGNITO_CLIENT_ID as string,
 *          client_secret: process.env.COGNITO_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function CognitoAuthProvider(config: CognitoAuthConfig): OIDCProviderConfig {
  const { domain, region, ...restConfig } = config
  return {
    ...restConfig,
    id: "cognito",
    scope: "email openid profile",
    issuer: `https://${domain}/${region}`,
    name: "Congnito",
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

export default CognitoAuthProvider
