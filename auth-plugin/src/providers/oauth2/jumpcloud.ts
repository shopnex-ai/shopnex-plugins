import type * as oauth from "oauth4webapi";
import type { OAuth2ProviderConfig, AccountInfo } from "../../types.js";

const authorization_server: oauth.AuthorizationServer = {
    issuer: "https://oauth.id.jumpcloud.com/",
    authorization_endpoint: "https://oauth.id.jumpcloud.com/oauth2/auth",
    token_endpoint: "https://oauth.id.jumpcloud.com/oauth2/token",
    userinfo_endpoint: "https://oauth.id.jumpcloud.com/userinfo",
};

type JumpCloudAuthConfig = OAuth2ProviderConfig;

/**
 * Add Jump Cloud OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/jumpcloud
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/jumpcloud
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {JumpCloudAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      JumpCloudAuthProvider({
 *          client_id: process.env.JUMP_CLOUD_CLIENT_ID as string,
 *          client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET as string,
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
 *      JumpCloudAuthProvider({
 *          client_id: process.env.JUMP_CLOUD_CLIENT_ID as string,
 *          client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function JumpCloudAuthProvider(
    config: JumpCloudAuthConfig
): OAuth2ProviderConfig {
    return {
        ...config,
        id: "jumpcloud",
        scope: "openid email profile",
        authorization_server,
        name: "Jump Cloud",
        algorithm: "oauth2",
        profile: (profile): AccountInfo => {
            return {
                sub: profile.email as string,
                name: profile.name as string,
                email: profile.email as string,
                picture: profile.picture as string,
            };
        },
    };
}

export default JumpCloudAuthProvider;
