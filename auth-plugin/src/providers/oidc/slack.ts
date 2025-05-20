import type {
    AccountInfo,
    OIDCProviderConfig,
    OAuthBaseProviderConfig,
} from "../../types";

type SlackAuthConfig = OAuthBaseProviderConfig;

/**
 * Add Slack OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/slack
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/slack
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {SlackAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      SlackAuthProvider({
 *          client_id: process.env.SLACK_CLIENT_ID as string,
 *          client_secret: process.env.SLACK_CLIENT_SECRET as string,
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
 *      SlackAuthProvider({
 *          client_id: process.env.SLACK_CLIENT_ID as string,
 *          client_secret: process.env.SLACK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function SlackAuthProvider(config: SlackAuthConfig): OIDCProviderConfig {
    return {
        ...config,
        id: "slack",
        scope: "openid email profile",
        issuer: "https://slack.com",
        name: "Slack",
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

export default SlackAuthProvider;
