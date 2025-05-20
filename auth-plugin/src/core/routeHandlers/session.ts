import { PayloadRequest } from "payload";
import { InvalidAPIRequest } from "../errors/apiErrors";
import { SessionRefresh } from "../protocols/session";
import { APP_COOKIE_SUFFIX } from "../../constants";

export function SessionHandlers(
    request: PayloadRequest,
    pluginType: string,
    kind: string,
    secret: string
) {
    if (pluginType === "admin") {
        // TODO: Implementation is not necessary as it is already handled by Payload. But can be customised.
        throw new InvalidAPIRequest();
    }
    switch (kind) {
        case "refresh":
            return SessionRefresh(
                `__${pluginType}-${APP_COOKIE_SUFFIX}`,
                secret,
                request
            );
        default:
            throw new InvalidAPIRequest();
    }
}
