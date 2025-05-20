import type {
    AccountInfo,
    OIDCProviderConfig,
    OAuthBaseProviderConfig,
} from "../../types.js";

type MicrosoftEntraAuthConfig = OAuthBaseProviderConfig & {
    tenant_id: string;
};

/**
 * Add Microsoft Entra OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/msft-entra
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/msft-entra
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {MicrosoftEntraAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      MicrosoftEntraAuthProvider({
 *          tenant_id: process.env.MICROSOFTENTRA_TENANT_ID as string,
 *          client_id: process.env.MICROSOFTENTRA_CLIENT_ID as string,
 *          client_secret: process.env.MICROSOFTENTRA_CLIENT_SECRET as string,
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
 *      MicrosoftEntraAuthProvider({
 *          tenant_id: process.env.MICROSOFTENTRA_TENANT_ID as string,
 *          client_id: process.env.MICROSOFTENTRA_CLIENT_ID as string,
 *          client_secret: process.env.MICROSOFTENTRA_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function MicrosoftEntraAuthProvider(
    config: MicrosoftEntraAuthConfig
): OIDCProviderConfig {
    return {
        ...config,
        id: "msft-entra",
        scope: "openid profile email offline_access",
        issuer: `https://login.microsoftonline.com/${config.tenant_id}/v2.0`,
        name: "Microsoft Entra",
        algorithm: "oidc",
        kind: "oauth",
        profile: (profile): AccountInfo => {
            const email = profile.email as string;
            return {
                sub: profile.sub as string,
                name: profile.name as string,
                email: email.toLowerCase(),
                picture: profile.picture as string,
            };
        },
    };
}

export default MicrosoftEntraAuthProvider;
