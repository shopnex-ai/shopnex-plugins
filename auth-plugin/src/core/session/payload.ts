import { BasePayload, PayloadRequest } from "payload"
import { UserNotFound } from "../errors/consoleErrors"
import { AccountInfo } from "../../types"
import { hashCode } from "../utils/hash"
import {
  createSessionCookies,
  invalidateOAuthCookies,
} from "../utils/cookies"
import { sessionResponse } from "../utils/session"
import { UserNotFoundAPIError } from "../errors/apiErrors"

type Collections = {
  accountsCollectionSlug: string
  usersCollectionSlug: string
}

export class PayloadSession {
  readonly #collections: Collections
  readonly #allowSignUp: boolean
  constructor(collections: Collections, allowSignUp?: boolean) {
    this.#collections = collections
    this.#allowSignUp = !!allowSignUp
  }
  async #upsertAccount(
    accountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    let userID: string | number

    const userQueryResults = await payload.find({
        collection: this.#collections.usersCollectionSlug as any,
        where: {
            email: {
                equals: accountInfo.email,
            },
        },
    });

    if (userQueryResults.docs.length === 0) {
      if (!this.#allowSignUp) {
        return new UserNotFoundAPIError()
      }

      const newShop = await payload.create({
          collection: 'shops' as any,
          data: {
              name: 'My Shop',
              slug: Math.random().toString(36).substring(2, 15),
          },
      })
      const newUser = await payload.create({
          collection: this.#collections.usersCollectionSlug as any,
          data: {
              email: accountInfo.email,
              emailVerified: true,
              shops: {
                  shop: newShop.id,
                  roles: ['shop-admin'],
              },
              password: hashCode(accountInfo.email + payload.secret).toString(),
          },
      });
      userID = newUser.id
    } else {
      userID = userQueryResults.docs[0].id as string
    }

    const accounts = await payload.find({
        collection: this.#collections.accountsCollectionSlug as any,
        where: {
            sub: { equals: accountInfo.sub },
        },
    });
    const data: Record<string, unknown> = {
      scope,
      name: accountInfo.name,
      picture: accountInfo.picture,
    }

    if (issuerName === "Passkey" && accountInfo.passKey) {
      data["passkey"] = {
        ...accountInfo.passKey,
      }
    }

    if (accounts.docs.length > 0) {
      data["sub"] = accountInfo.sub
      data["issuerName"] = issuerName
      data["user"] = userID
      await payload.update({
          collection: this.#collections.accountsCollectionSlug as any,
          where: {
              id: {
                  equals: accounts.docs[0].id,
              },
          },
          data,
      });
    } else {
      data["sub"] = accountInfo.sub
      data["issuerName"] = issuerName
      data["user"] = userID
      await payload.create({
          collection: this.#collections.accountsCollectionSlug as any,
          data,
      });
    }
    return userID
  }
  async createSession(
    accountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    request: PayloadRequest,
    clientOrigin: string,
  ) {
    const { payload } = request

    const userID = await this.#upsertAccount(
      accountInfo,
      scope,
      issuerName,
      payload,
    )

    const fieldsToSign = {
        id: userID,
        email: accountInfo.email,
        collection: this.#collections.usersCollectionSlug as any,
    };

    let cookies: string[] = []
    cookies = [
      ...(await createSessionCookies(
        `${payload.config.cookiePrefix!}-token`,
        payload.secret,
        fieldsToSign,
      )),
    ]
    cookies = invalidateOAuthCookies(cookies)

    return sessionResponse(cookies, clientOrigin)
  }
}
