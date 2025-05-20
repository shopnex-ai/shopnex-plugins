import type * as oauth from "oauth4webapi";
import type {
    OAuth2ProviderConfig,
    AccountInfo,
    OAuthBaseProviderConfig,
} from "../../types.js";

const authorization_server: oauth.AuthorizationServer = {
    issuer: "https://discord.com",
    authorization_endpoint: "https://discord.com/api/oauth2/authorize",
    token_endpoint: "https://discord.com/api/oauth2/token",
    userinfo_endpoint: "https://discord.com/api/users/@me",
};
type DiscordAuthConfig = OAuthBaseProviderConfig;

/**
 * Add Discord OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/discord
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/discord
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {DiscordAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      DiscordAuthProvider({
 *          client_id: process.env.DISCORD_CLIENT_ID as string,
 *          client_secret: process.env.DISCORD_CLIENT_SECRET as string,
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
 *      DiscordAuthProvider({
 *          client_id: process.env.DISCORD_CLIENT_ID as string,
 *          client_secret: process.env.DISCORD_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function DiscordAuthProvider(config: DiscordAuthConfig): OAuth2ProviderConfig {
    return {
        ...config,
        id: "discord",
        scope: "identify email",
        authorization_server,
        name: "Discord",
        algorithm: "oauth2",
        kind: "oauth",
        profile: (profile): AccountInfo => {
            const format = profile.avatar.toString().startsWith("a_")
                ? "gif"
                : "png";

            return {
                sub: profile.id as string,
                name:
                    (profile.username as string) ??
                    (profile.global_name as string),
                email: profile.email as string,
                picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`,
            };
        },
    };
}

export default DiscordAuthProvider;
