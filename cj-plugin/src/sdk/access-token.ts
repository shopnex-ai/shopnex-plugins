import * as cjSdk from './cj-sdk'

type Credentials = {
  emailAddress: string
  password: string
  refreshToken?: string
}

let credentials: Credentials | null = null

export const getCurrentAccessToken = async () => {
  if (!credentials?.emailAddress || !credentials?.password) {
    throw new Error('Email address and password token are required')
  }
  const { emailAddress, password, refreshToken } = credentials
  let accessToken = (await cjSdk.refreshAccessToken(refreshToken || '')).accessToken
  if (!accessToken) {
    accessToken = (await cjSdk.getAccessToken(emailAddress, password)).accessToken
  }
  return accessToken
}

export const setCurrentAccessToken = ({ emailAddress, password, refreshToken }: Credentials) => {
  credentials = { emailAddress, password, refreshToken }
}
