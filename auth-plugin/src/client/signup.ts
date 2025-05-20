import { PasswordSignupPayload, passwordSignup } from "./password";

interface BaseOptions {
    name: string;
}

export const appSignup = (options: BaseOptions) => {
    return {
        password: async (paylaod: PasswordSignupPayload) =>
            await passwordSignup(options, paylaod),
    };
};
