import type * as oauth from "oauth4webapi";
import type {
    OAuth2ProviderConfig,
    AccountInfo,
    OAuthBaseProviderConfig,
} from "../../types.js";

const authorization_server: oauth.AuthorizationServer = {
    issuer: "https://id.twitch.tv/oauth2",
    authorization_endpoint: "https://id.twitch.tv/oauth2/authorize",
    token_endpoint: "https://id.twitch.tv/oauth2/token",
    userinfo_endpoint: "https://id.twitch.tv/oauth2/userinfo",
};

type TwitchAuthConfig = OAuthBaseProviderConfig;

/**
 * Add Twitch OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/twitch
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/twitch
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {TwitchAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      TwitchAuthProvider({
 *          client_id: process.env.TWITCH_CLIENT_ID as string,
 *          client_secret: process.env.TWITCH_CLIENT_SECRET as string,
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
 *      TwitchAuthProvider({
 *          client_id: process.env.TWITCH_CLIENT_ID as string,
 *          client_secret: process.env.TWITCH_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function TwitchAuthProvider(config: TwitchAuthConfig): OAuth2ProviderConfig {
    return {
        ...config,
        id: "twitch",
        scope: "openid user:read:email",
        authorization_server,
        name: "Twitch",
        algorithm: "oauth2",
        kind: "oauth",
        params: {
            scope: "openid user:read:email",
            claims: JSON.stringify({
                id_token: {
                    email: null,
                    picture: null,
                    preferred_username: null,
                },
                userinfo: {
                    email: null,
                    picture: null,
                    preferred_username: null,
                },
            }),
        },
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

export default TwitchAuthProvider;
