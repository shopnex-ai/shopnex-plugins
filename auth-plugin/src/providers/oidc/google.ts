import type {
    AccountInfo,
    OIDCProviderConfig,
    OAuthBaseProviderConfig,
} from "../../types";

type GoogleAuthConfig = OAuthBaseProviderConfig;

/**
 * Add Google OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/google
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/google
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {GoogleAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      GoogleAuthProvider({
 *          client_id: process.env.GOOGLE_CLIENT_ID as string,
 *          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
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
 *      GoogleAuthProvider({
 *          client_id: process.env.GOOGLE_CLIENT_ID as string,
 *          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function GoogleAuthProvider(config: GoogleAuthConfig): OIDCProviderConfig {
    return {
        ...config,
        id: "google",
        scope: "openid email profile",
        issuer: "https://accounts.google.com",
        name: "Google",
        algorithm: "oidc",
        kind: "oauth",
        profile: (profile): AccountInfo => {
            return {
                sub: profile.sub as string,
                name: profile.name as string,
                email: profile.email as string,
                picture: profile.picture as string,
            };
        },
    };
}

export default GoogleAuthProvider;
