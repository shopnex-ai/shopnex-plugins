import type { PayloadRequest } from "payload";
import type { AccountInfo, OAuthProviderConfig } from "../../types";
import {
    InvalidOAuthResource,
    InvalidProvider,
} from "../errors/consoleErrors";
import { UnifiedOAuthAuthorization } from "../protocols/oauth/unified_authorization";
import { UnifiedOAuthCallback } from "../protocols/oauth/unified_callback";

export function OAuthHandlers(
    pluginType: string,
    request: PayloadRequest,
    resource: string,
    provider: OAuthProviderConfig,
    sessionCallBack: (
        oauthAccountInfo: AccountInfo,
        clientOrigin: string
    ) => Promise<Response>,
    clientOrigin?: string
): Promise<Response> {
    if (!provider) {
        throw new InvalidProvider();
    }

    switch (resource) {
        case "authorization":
            return UnifiedOAuthAuthorization(
                pluginType,
                request,
                provider,
                clientOrigin
            );
        case "callback":
            return UnifiedOAuthCallback(
                pluginType,
                request,
                provider,
                sessionCallBack
            );
        default:
            throw new InvalidOAuthResource();
    }
}
