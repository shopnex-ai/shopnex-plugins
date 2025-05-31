import {
    CollectionSlug,
    getCookieExpiration,
    parseCookies,
    PayloadRequest,
} from "payload";
import {
    AuthenticationFailed,
    EmailAlreadyExistError,
    InvalidCredentials,
    InvalidRequestBodyError,
    UnauthorizedAPIRequest,
    UserNotFoundAPIError,
} from "../errors/apiErrors";
import { hashPassword, verifyPassword } from "../utils/password";
import { SuccessKind } from "../../types";
import { ephemeralCode, verifyEphemeralCode } from "../utils/hash";
import { EPHEMERAL_CODE_COOKIE_NAME } from "../../constants";
import {
    createSessionCookies,
    invalidateSessionCookies,
    verifySessionCookie,
} from "../utils/cookies";
import { revokeSession } from "../utils/session";

export const PasswordSignin = async (
    request: PayloadRequest,
    internal: {
        usersCollectionSlug: string;
    },
    sessionCallBack: (user: { id: string; email: string }) => Promise<Response>
) => {
    const body =
        request.json &&
        ((await request.json?.()) as { email: string; password: string });

    if (!body?.email || !body.password) {
        return new InvalidRequestBodyError();
    }

    const { payload } = request;
    const { docs } = await payload.find({
        collection: internal.usersCollectionSlug as CollectionSlug,
        where: {
            email: { equals: body.email },
        },
        limit: 1,
    });

    if (docs.length !== 1) {
        return new UserNotFoundAPIError();
    }

    const user: any = docs[0];
    const isVerifed = await verifyPassword(
        body.password,
        user["hashedPassword"],
        user["salt"],
        user["hashIterations"]
    );
    if (!isVerifed) {
        return new InvalidCredentials();
    }
    return sessionCallBack({
        id: user.id as string,
        email: body.email,
    });
};

export const PasswordSignup = async (
    request: PayloadRequest,
    internal: {
        usersCollectionSlug: string;
    },
    sessionCallBack: (user: { id: string; email: string }) => Promise<Response>
) => {
    const { logger } = request.payload;
    const body =
        request.json &&
        ((await request.json?.()) as {
            email: string;
            password: string;
            allowAutoSignin?: boolean;
            profile?: Record<string, unknown>;
        });

    if (!body?.email || !body.password) {
        return new InvalidRequestBodyError();
    }

    const { payload } = request;
    const { docs } = await payload.find({
        collection: internal.usersCollectionSlug as any,
        where: {
            email: { equals: body.email },
        },
        limit: 1,
    });

    if (docs.length > 0) {
        return new EmailAlreadyExistError();
    }

    const {
        hash: hashedPassword,
        salt,
        iterations,
    } = await hashPassword(body.password);

    logger.info("Creating shop", "My Shop");
    const newShop = await payload.create({
        collection: "shops" as any,
        data: {
            name: "My Shop",
            handle: Math.random().toString(36).substring(2, 15),
        },
        req: request,
    });
    logger.debug("New shop created", newShop);

    logger.info("Creating user", body.email);
    const user = await payload.create({
        collection: internal.usersCollectionSlug as any,
        data: {
            email: body.email,
            emailVerified: false,
            password: hashedPassword,
            hashIterations: iterations,
            salt,
            shops: [
                {
                    shop: newShop.id,
                    roles: ["shop-admin"],
                },
            ],
            ...body.profile,
        },
        showHiddenFields: true,
        req: request,
    });
    logger.debug("User created", user);
    // send verification email
    const verificationResult = await payload.verifyEmail({
        collection: internal.usersCollectionSlug as any,
        token: user._verificationToken,
    });

    logger.info("Creating account entry");
    await payload.create({
        collection: "admins" as any,
        data: {
            sub: body.email,
            issuerName: "Password",
            user: user.id,
            shop: newShop.id,
            scope: "admin",
            name: body.profile?.name || body.email.split("@")[0],
        },
        req: request,
    });

    if (body.allowAutoSignin) {
        return sessionCallBack({
            id: user.id as string,
            email: body.email,
        });
    }

    return Response.json(
        {
            message: "Signed up successfully",
            kind: SuccessKind.Created,
            isSuccess: true,
            isError: false,
        },
        { status: 201 }
    );
};

export const ForgotPasswordInit = async (
    request: PayloadRequest,
    internal: {
        usersCollectionSlug: string;
    }
) => {
    const { payload } = request;

    const body =
        request.json &&
        ((await request.json?.()) as {
            email: string;
        });

    if (!body?.email) {
        return new InvalidRequestBodyError();
    }

    const { docs } = await payload.find({
        collection: internal.usersCollectionSlug as any,
        where: {
            email: { equals: body.email },
        },
        limit: 1,
    });

    if (docs.length !== 1) {
        return new UserNotFoundAPIError();
    }
    const { code, hash } = await ephemeralCode(6, payload.secret);

    await payload.sendEmail({
        to: body.email,
        subject: "Password recovery",
        text: "Password recovery code: " + code,
    });

    const res = new Response(
        JSON.stringify({
            message: "Password recovery initiated successfully",
            kind: SuccessKind.Created,
            isSuccess: true,
            isError: false,
        }),
        { status: 201 }
    );
    const tokenExpiration = getCookieExpiration({
        seconds: 300,
    });
    res.headers.append(
        "Set-Cookie",
        `${EPHEMERAL_CODE_COOKIE_NAME}=${hash};Path=/;HttpOnly;Secure=true;SameSite=lax;Expires=${tokenExpiration.toUTCString()}`
    );
    return res;
};

export const ForgotPasswordVerify = async (
    request: PayloadRequest,
    internal: {
        usersCollectionSlug: string;
    }
) => {
    const { payload } = request;

    const body =
        request.json &&
        ((await request.json?.()) as {
            email: string;
            password: string;
            code: string;
        });

    if (!body?.email || !body?.password || !body.code) {
        return new InvalidRequestBodyError();
    }

    const cookies = parseCookies(request.headers);
    const hash = cookies.get(EPHEMERAL_CODE_COOKIE_NAME);
    if (!hash) {
        return new UnauthorizedAPIRequest();
    }

    const isVerified = await verifyEphemeralCode(
        body.code,
        hash,
        payload.secret
    );

    if (!isVerified) {
        return new AuthenticationFailed();
    }
    const { docs } = await payload.find({
        collection: internal.usersCollectionSlug as any,
        where: {
            email: { equals: body.email },
        },
        limit: 1,
    });

    if (docs.length !== 1) {
        return new UserNotFoundAPIError();
    }

    const {
        hash: hashedPassword,
        salt,
        iterations,
    } = await hashPassword(body.password);

    await payload.update({
        collection: internal.usersCollectionSlug as any,
        id: docs[0].id,
        data: {
            hashedPassword,
            salt,
            hashIterations: iterations,
        },
    });

    const res = new Response(
        JSON.stringify({
            message: "Password recovered successfully",
            kind: SuccessKind.Updated,
            isSuccess: true,
            isError: false,
        }),
        { status: 201 }
    );
    res.headers.append(
        "Set-Cookie",
        `${EPHEMERAL_CODE_COOKIE_NAME}=;Path=/;HttpOnly;Secure=true;SameSite=lax;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
    return res;
};

export const ResetPassword = async (
    cookieName: string,
    secret: string,
    internal: {
        usersCollectionSlug: string;
    },
    request: PayloadRequest
) => {
    const { payload } = request;
    const cookies = parseCookies(request.headers);
    const token = cookies.get(cookieName);
    if (!token) {
        return new UnauthorizedAPIRequest();
    }

    const jwtResponse = await verifySessionCookie(token, secret);
    if (!jwtResponse.payload) {
        return new UnauthorizedAPIRequest();
    }

    const body =
        request.json &&
        ((await request.json?.()) as {
            email: string;
            currentPassword: string;
            newPassword: string;
            signoutOnUpdate?: boolean | undefined;
        });

    if (!body?.email || !body?.currentPassword || !body?.newPassword) {
        return new InvalidRequestBodyError();
    }

    const { docs } = await payload.find({
        collection: internal.usersCollectionSlug as any,
        where: {
            email: { equals: body.email },
        },
        limit: 1,
    });

    if (docs.length !== 1) {
        return new UserNotFoundAPIError();
    }

    const user = docs[0];
    const isVerifed = await verifyPassword(
        body.currentPassword,
        user["hashedPassword"],
        user["salt"],
        user["hashIterations"]
    );
    if (!isVerifed) {
        return new InvalidCredentials();
    }

    const {
        hash: hashedPassword,
        salt,
        iterations,
    } = await hashPassword(body.newPassword);

    await payload.update({
        collection: internal.usersCollectionSlug as any,
        id: user.id,
        data: {
            hashedPassword,
            salt,
            hashIterations: iterations,
        },
    });

    if (!!body.signoutOnUpdate) {
        let cookies: string[] = [];
        cookies = [...invalidateSessionCookies(cookieName, cookies)];
        return revokeSession(cookies);
    }

    const res = new Response(
        JSON.stringify({
            message: "Password reset complete",
            kind: SuccessKind.Updated,
            isSuccess: true,
            isError: false,
        }),
        {
            status: 201,
        }
    );
    return res;
};
