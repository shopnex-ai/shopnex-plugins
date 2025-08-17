import * as oauth from "oauth4webapi";
import type { OAuthProviderConfig } from "../../../types";
import { getCallbackURL } from "../../utils/cb";
import { PayloadRequest } from "payload";

export async function UnifiedOAuthAuthorization(
    pluginType: string,
    request: PayloadRequest,
    providerConfig: OAuthProviderConfig,
    clientOrigin?: string
): Promise<Response> {
    const callback_url = getCallbackURL(
        request.payload.config.serverURL,
        pluginType,
        providerConfig.id
    );
    const code_verifier = oauth.generateRandomCodeVerifier();
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);
    const code_challenge_method = "S256";

    const { client_id, scope, params, algorithm } = providerConfig;
    const client: oauth.Client = { client_id };

    let as: oauth.AuthorizationServer;
    
    if (algorithm === "oidc" && providerConfig.issuer) {
        const issuer_url = new URL(providerConfig.issuer);
        as = await oauth
            .discoveryRequest(issuer_url, { algorithm })
            .then((response) => oauth.processDiscoveryResponse(issuer_url, response));
    } else if (algorithm === "oauth2" && providerConfig.authorization_server) {
        as = providerConfig.authorization_server;
    } else {
        throw new Error(`Invalid provider configuration for ${providerConfig.id}`);
    }

    const cookies: string[] = [];
    const cookieMaxage = new Date(Date.now() + 300 * 1000);

    const authorizationURL = new URL(as.authorization_endpoint!);
    authorizationURL.searchParams.set("client_id", client.client_id);
    authorizationURL.searchParams.set("redirect_uri", callback_url.toString());
    authorizationURL.searchParams.set("response_type", "code");
    authorizationURL.searchParams.set("scope", scope as string);
    authorizationURL.searchParams.set("code_challenge", code_challenge);
    authorizationURL.searchParams.set("code_challenge_method", code_challenge_method);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            authorizationURL.searchParams.set(key, value);
        });
    }

    if (as.code_challenge_methods_supported?.includes("S256") !== true) {
        if (algorithm === "oidc") {
            const nonce = oauth.generateRandomNonce();
            authorizationURL.searchParams.set("nonce", nonce);
            cookies.push(
                `__session-oauth-nonce=${nonce};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
            );
        } else {
            const state = oauth.generateRandomState();
            authorizationURL.searchParams.set("state", state);
            cookies.push(
                `__session-oauth-state=${state};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
            );
        }
    }

    const origin = clientOrigin || request.headers.get("origin") || request.headers.get("referer") || "";
    if (origin) {
        const cookieName = algorithm === "oidc" ? "__session-client-origin" : "__client-origin";
        cookies.push(
            `${cookieName}=${encodeURIComponent(origin)};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
        );
    }

    cookies.push(
        `__session-code-verifier=${code_verifier};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
    );

    const res = new Response(null, {
        status: 302,
        headers: {
            Location: authorizationURL.href,
        },
    });

    cookies.forEach((cookie) => {
        res.headers.append("Set-Cookie", cookie);
    });

    return res;
}