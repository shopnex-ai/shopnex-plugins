import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface KeyCloakAuthConfig extends OAuthBaseProviderConfig {
  realm: string
  domain: string
  identifier: string
  name: string
}

/**
 * Add KeyCloak OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/{name}
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/{name}
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {KeyCloakAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      KeyCloakAuthProvider({
 *          realm: process.env.KEYCLOAK_REALM as string,
 *          domain: process.env.KEYCLOAK_DOMAIN as string,
 *          identifier: process.env.KEYCLOAK_IDENTIFIER as string,
 *          name: process.env.KEYCLOAK_NAME as string,
 *          client_id: process.env.KEYCLOAK_CLIENT_ID as string,
 *          client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
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
 *      KeyCloakAuthProvider({
 *          realm: process.env.KEYCLOAK_REALM as string,
 *          domain: process.env.KEYCLOAK_DOMAIN as string,
 *          identifier: process.env.KEYCLOAK_IDENTIFIER as string,
 *          name: process.env.KEYCLOAK_NAME as string,
 *          client_id: process.env.KEYCLOAK_CLIENT_ID as string,
 *          client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function KeyCloakAuthProvider(config: KeyCloakAuthConfig): OIDCProviderConfig {
  const { realm, domain, identifier, name, ...restConfig } = config
  return {
    ...restConfig,
    id: identifier,
    scope: "email openid profile",
    issuer: `https://${domain}/realms/${realm}`,
    name,
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

export default KeyCloakAuthProvider
