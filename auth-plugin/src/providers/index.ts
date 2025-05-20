import GoogleAuthProvider from "./oidc/google";
import GitHubAuthProvider from "./oauth2/github";
import GitLabAuthProvider from "./oidc/gitlab";
import AtlassianAuthProvider from "./oauth2/atlassian";
import DiscordAuthProvider from "./oauth2/discord";
import FacebookAuthProvider from "./oauth2/facebook";
import SlackAuthProvider from "./oidc/slack";
import Auth0AuthProvider from "./oauth2/auth0";
import CognitoAuthProvider from "./oidc/cognito";
import KeyCloakAuthProvider from "./oidc/keycloak";
import PasskeyAuthProvider from "./passkey";
import MicrosoftEntraAuthProvider from "./oidc/microsoft-entra";
import AppleOIDCAuthProvider from "./oidc/apple";
import AppleOAuth2Provider from "./oauth2/apple";
import JumpCloudAuthProvider from "./oauth2/jumpcloud";
import TwitchAuthProvider from "./oauth2/twitch";
import PasswordProvider from "./password";

export {
    GoogleAuthProvider,
    GitHubAuthProvider,
    GitLabAuthProvider,
    AtlassianAuthProvider,
    DiscordAuthProvider,
    FacebookAuthProvider,
    SlackAuthProvider,
    Auth0AuthProvider,
    CognitoAuthProvider,
    KeyCloakAuthProvider,
    PasskeyAuthProvider,
    MicrosoftEntraAuthProvider,
    AppleOIDCAuthProvider,
    AppleOAuth2Provider,
    JumpCloudAuthProvider,
    TwitchAuthProvider,
    PasswordProvider,
};
