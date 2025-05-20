import { parseCookies, type PayloadRequest } from "payload";
import * as oauth from "oauth4webapi";
import type { OAuth2ProviderConfig, AccountInfo } from "../../../types";
import { getCallbackURL } from "../../utils/cb";
import { MissingOrInvalidSession } from "../../errors/consoleErrors";

export async function OAuth2Callback(
    pluginType: string,
    request: PayloadRequest,
    providerConfig: OAuth2ProviderConfig,
    session_callback: (
        oauthAccountInfo: AccountInfo,
        clientOrigin: string
    ) => Promise<Response>
): Promise<Response> {
    const parsedCookies = parseCookies(request.headers);

    const code_verifier = parsedCookies.get("__session-code-verifier");
    const state = parsedCookies.get("__session-oauth-state");
    const clientOrigin = parsedCookies.get("__client-origin");

    if (!code_verifier || !clientOrigin) {
        throw new MissingOrInvalidSession();
    }

    const {
        client_id,
        client_secret,
        authorization_server,
        profile,
        client_auth_type,
    } = providerConfig;

    const client: oauth.Client = {
        client_id,
    };

    const clientAuth =
        client_auth_type === "client_secret_basic"
            ? oauth.ClientSecretBasic(client_secret ?? "")
            : oauth.ClientSecretPost(client_secret ?? "");

    const current_url = new URL(request.url as string) as URL;
    const callback_url = getCallbackURL(
        request.payload.config.serverURL,
        pluginType,
        providerConfig.id
    );
    const as = authorization_server;

    const params = oauth.validateAuthResponse(as, client, current_url, state!);

    const grantResponse = await oauth.authorizationCodeGrantRequest(
        as,
        client,
        clientAuth,
        params,
        callback_url.toString(),
        code_verifier
    );
    let body = (await grantResponse.json()) as { scope: string | string[] };
    let response = new Response(JSON.stringify(body), grantResponse);
    if (Array.isArray(body.scope)) {
        body.scope = body.scope.join(" ");
        response = new Response(JSON.stringify(body), grantResponse);
    }

    const token_result = await oauth.processAuthorizationCodeResponse(
        as,
        client,
        response
    );

    const userInfoResponse = await oauth.userInfoRequest(
        as,
        client,
        token_result.access_token
    );
    const userInfo = (await userInfoResponse.json()) as Record<string, string>;
    if (providerConfig.id === "github" && !userInfo.email) {
        const emailResponse = await fetch(
            "https://api.github.com/user/emails",
            {
                headers: {
                    Authorization: `Bearer ${token_result.access_token}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );
        const emails = (await emailResponse.json()) as {
            email: string;
            primary: boolean;
            verified: boolean;
            visibility: string | null;
        }[];

        const primaryEmail = emails.find((e) => e.primary && e.verified);
        if (primaryEmail) {
            userInfo.email = primaryEmail.email;
        }
    }
    return session_callback(profile(userInfo), clientOrigin);
}
