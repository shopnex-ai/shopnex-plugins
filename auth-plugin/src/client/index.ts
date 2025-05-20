import { MissingEnv } from "../core/errors/consoleErrors";
import {
    forgotPassword,
    ForgotPasswordPayload,
    passwordRecover,
    PasswordRecoverPayload,
    passwordReset,
    PasswordResetPayload,
} from "./password";
import { refresh } from "./refresh";
import { adminSignin, appSignin } from "./signin";
import { appSignup } from "./signup";

interface AppClientOptions {
    name: string;
}

export const appClient = (options: AppClientOptions) => {
    if (!process.env.NEXT_PUBLIC_SERVER_URL) {
        throw new MissingEnv("NEXT_PUBLIC_SERVER_URL");
    }
    return {
        signin: () => appSignin(options),
        signup: () => appSignup(options),
        resetPassword: async (payload: PasswordResetPayload) =>
            await passwordReset(options, payload),
        forgotPassword: async (payload: ForgotPasswordPayload) =>
            await forgotPassword(options, payload),
        passwordRecover: async (payload: PasswordRecoverPayload) =>
            await passwordRecover(options, payload),
        refresh: async () => await refresh(options),
    };
};

export const adminClient = () => {
    return {
        signin: () => adminSignin(),
    };
};
