import type {
    BasePayload,
    Config,
    Endpoint,
    PayloadRequest,
    Plugin,
} from "payload";
import {
    EndpointsFactory,
    OAuthEndpointStrategy,
    PasskeyEndpointStrategy,
} from "../core/endpoints";
import type { AccountInfo, ProvidersConfig } from "../types";
import { PayloadSession } from "../core/session/payload";
import { InvalidServerURL } from "../core/errors/consoleErrors";
import { getOAuthProviders, getPasskeyProvider } from "../providers/utils";
import { preflightCollectionCheck } from "../core/preflights/collections";

interface PluginOptions {
    /* Enable or disable plugin
     * @default true
     */
    enabled?: boolean;
    /*
     * OAuth Providers
     */
    providers: ProvidersConfig[];

    /*
     * Accounts collections config
     */
    accountsCollectionSlug: string;

    /* Enable or disable user creation. WARNING: If applied to your admin users collection it will allow ANYONE to sign up as an admin.
     * @default false
     */
    allowSignUp?: boolean;
}

export const adminAuthPlugin =
    (pluginOptions: PluginOptions): Plugin =>
    async (incomingConfig: Config): Promise<Config> => {
        const config = { ...incomingConfig };

        if (pluginOptions.enabled === false) {
            return config;
        }

        if (!config.serverURL) {
            throw new InvalidServerURL();
        }

        const { accountsCollectionSlug, providers, allowSignUp } =
            pluginOptions;

        preflightCollectionCheck(
            [config.admin?.user!, accountsCollectionSlug],
            config.collections
        );

        config.admin = {
            ...(config.admin ?? {}),
        };

        const session = new PayloadSession(
            {
                accountsCollectionSlug: accountsCollectionSlug,
                usersCollectionSlug: config.admin.user!,
            },
            allowSignUp
        );

        const oauthProviders = getOAuthProviders(providers);
        const passkeyProvider = getPasskeyProvider(providers);
        const passwordProvider = providers.find(
            (provider) => provider.kind === "password"
        );

        const endpointsFactory = new EndpointsFactory("admin");

        let oauthEndpoints: Endpoint[] = [];
        let passkeyEndpoints: Endpoint[] = [];
        let passwordEndpoints: Endpoint[] = [];

        if (Object.keys(oauthProviders).length > 0) {
            endpointsFactory.registerStrategy(
                "oauth",
                new OAuthEndpointStrategy(oauthProviders)
            );
            oauthEndpoints = endpointsFactory.createEndpoints("oauth", {
                sessionCallback: (
                    oauthAccountInfo: AccountInfo,
                    scope: string,
                    issuerName: string,
                    request: PayloadRequest,
                    clientOrigin: string
                ) =>
                    session.createSession(
                        oauthAccountInfo,
                        scope,
                        issuerName,
                        request,
                        clientOrigin
                    ),
            });
        }

        if (passkeyProvider) {
            endpointsFactory.registerStrategy(
                "passkey",
                new PasskeyEndpointStrategy()
            );
            passkeyEndpoints = endpointsFactory.createEndpoints("passkey");
        }

        if (passwordProvider) {
            const { PasswordAuthHandlers } = await import(
                "../core/routeHandlers/password"
            );

            passwordEndpoints.push(
                {
                    path: "/admin/auth/signin",
                    method: "post",
                    handler: async (req: PayloadRequest) => {
                        return PasswordAuthHandlers(
                            req,
                            "admin",
                            "signin",
                            { usersCollectionSlug: config.admin?.user! },
                            (user) =>
                                session.passwordSessionCallback(
                                    user,
                                    req.payload,
                                    req.query.origin as string
                                ),
                            req.payload.secret
                        );
                    },
                },
                {
                    path: "/admin/auth/signup",
                    method: "post",
                    handler: async (req: PayloadRequest) => {
                        return PasswordAuthHandlers(
                            req,
                            "admin",
                            "signup",
                            { usersCollectionSlug: config.admin?.user! },
                            (user) =>
                                session.passwordSessionCallback(
                                    user,
                                    req.payload,
                                    req.query.origin as string
                                ),
                            req.payload.secret
                        );
                    },
                },
                {
                    path: "/admin/auth/forgot-password",
                    method: "post",
                    handler: async (req: PayloadRequest) => {
                        return PasswordAuthHandlers(
                            req,
                            "admin",
                            "forgot-password",
                            { usersCollectionSlug: config.admin?.user! },
                            (user) =>
                                session.passwordSessionCallback(
                                    user,
                                    req.payload,
                                    req.query.origin as string
                                ),
                            req.payload.secret,
                            req.query.stage as string
                        );
                    },
                },
                {
                    path: "/admin/auth/reset-password",
                    method: "post",
                    handler: async (req: PayloadRequest) => {
                        return PasswordAuthHandlers(
                            req,
                            "admin",
                            "reset-password",
                            { usersCollectionSlug: config.admin?.user! },
                            (user) =>
                                session.passwordSessionCallback(
                                    user,
                                    req.payload,
                                    req.query.origin as string
                                ),
                            req.payload.secret
                        );
                    },
                }
            );
        }

        config.endpoints = [
            ...(config.endpoints ?? []),
            ...oauthEndpoints,
            ...passkeyEndpoints,
            ...passwordEndpoints,
        ];
        return config;
    };
