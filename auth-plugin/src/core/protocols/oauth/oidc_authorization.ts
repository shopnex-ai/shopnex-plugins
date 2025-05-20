import * as oauth from "oauth4webapi";
import type { OIDCProviderConfig } from "../../../types";
import { getCallbackURL } from "../../utils/cb";
import { PayloadRequest } from "payload";

export async function OIDCAuthorization(
    pluginType: string,
    request: PayloadRequest,
    providerConfig: OIDCProviderConfig,
    clientOrigin?: string | undefined
): Promise<Response> {
    const callback_url = getCallbackURL(
        request.payload.config.serverURL,
        pluginType,
        providerConfig.id
    );
    const code_verifier = oauth.generateRandomCodeVerifier();
    const code_challenge =
        await oauth.calculatePKCECodeChallenge(code_verifier);
    const code_challenge_method = "S256";
    const { client_id, issuer, algorithm, scope, params } = providerConfig;

    const client: oauth.Client = {
        client_id,
    };
    const issuer_url = new URL(issuer) as URL;
    const as = await oauth
        .discoveryRequest(issuer_url, { algorithm })
        .then((response) =>
            oauth.processDiscoveryResponse(issuer_url, response)
        );

    const cookies: string[] = [];
    const cookieMaxage = new Date(Date.now() + 300 * 1000);

    const authorizationURL = new URL(as.authorization_endpoint!);
    authorizationURL.searchParams.set("client_id", client.client_id);
    authorizationURL.searchParams.set("redirect_uri", callback_url.toString());
    authorizationURL.searchParams.set("response_type", "code");
    authorizationURL.searchParams.set("scope", scope as string);
    authorizationURL.searchParams.set("code_challenge", code_challenge);
    authorizationURL.searchParams.set(
        "code_challenge_method",
        code_challenge_method
    );

    if (params) {
        Object.entries(params).map(([key, value]) => {
            authorizationURL.searchParams.set(key, value);
        });
    }

    if (as.code_challenge_methods_supported?.includes("S256") !== true) {
        const nonce = oauth.generateRandomNonce();
        authorizationURL.searchParams.set("nonce", nonce);
        cookies.push(
            `__session-oauth-nonce=${nonce};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
        );
    }
    cookies.push(
        `__session-code-verifier=${code_verifier};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
    );

    if (clientOrigin && clientOrigin !== undefined) {
        cookies.push(
            `__session-client-origin=${clientOrigin};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`
        );
    }

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
