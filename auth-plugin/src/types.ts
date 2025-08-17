import type { AuthorizationServer } from "oauth4webapi";

export enum ErrorKind {
    NotFound = "NotFound",
    InternalServer = "InternalServer",
    BadRequest = "BadRequest",
    NotAuthorized = "NotAuthorized",
    NotAuthenticated = "NotAuthenticated",
    Conflict = "Conflict",
}

export enum SuccessKind {
    Created = "Created",
    Updated = "Updated",
    Retrieved = "Retrieved",
    Deleted = "Deleted",
}
export interface AuthPluginOutput {
    message: string;
    kind: ErrorKind | SuccessKind;
    data: any;
    isSuccess: boolean;
    isError: boolean;
}

/**
 * Generic OAuth provider callback output
 *
 * @interface OAuthProviderOutput
 * @internal
 */
interface OAuthProviderOutput {
    /**
     * OAuth Provider ID. Usually the slugified provider name
     *
     * @type {string}
     */
    id: string;
    /**
     * OAuth provider name. For example Google, Apple
     *
     * @type {string}
     */
    name: string;
    /**
     * Scope of account attributes to request from the provider
     *
     * @type {string}
     */
    scope: string;

    /**
     * Profile callback that returns account information requried to link with users
     *
     * @type {(
     *     profile: Record<string, string | number | boolean | object>,
     *   ) => AccountInfo}
     */
    profile: (
        profile: Record<string, string | number | boolean | object>
    ) => AccountInfo;
}

export interface OAuthBaseProviderConfig {
    client_id: string;
    client_secret?: string;
    /*
     * Oauth provider Client Type
     */
    client_auth_type?: "client_secret_basic" | "client_secret_post";
    /*
     * Additional parameters you would like to add to query for the provider
     */
    params?: Record<string, string>;
}

export interface OAuthProviderConfig
    extends OAuthProviderOutput,
        OAuthBaseProviderConfig {
    algorithm: "oauth2" | "oidc";
    kind: "oauth";
    issuer?: string;
    authorization_server?: AuthorizationServer;
}

export interface AccountInfo {
    sub: string;
    name: string;
    picture: string;
    email: string;
    passKey?: {
        credentialId: string;
        publicKey?: Uint8Array;
        counter: number;
        transports?: string[];
        deviceType: string;
        backedUp: boolean;
    };
}

export type PasswordProviderConfig = {
    id: string;
    kind: "password";
    // name: string
    // verfiyEmail?: boolean
    // passwordless?: boolean
    // mfa?: "OTP" | "TOTP" | "None"
    // signinCallback?: () => void
    // signupCallback?: () => void
};

export interface CredentialsAccountInfo {
    name: string;
    email: string;
}

export type PasskeyProviderConfig = {
    id: string;
    kind: "passkey";
};

export type ProvidersConfig =
    | OAuthProviderConfig
    | PasskeyProviderConfig
    | PasswordProviderConfig;

export type AuthenticationStrategy = "Cookie";
