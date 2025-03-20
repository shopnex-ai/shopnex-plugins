import type { APIResponse } from '../../error-types'
import type {
  ConfirmDisputeRequest,
  ConfirmDisputeResponse,
  CreateDisputeRequest,
  DisputeAPIResponse,
} from './dispute-types.ts'

import { cjApiClient } from '../../api-client'
import { getCurrentAccessToken } from '../access-token'

export async function createDispute(
  requestData: CreateDisputeRequest,
): Promise<APIResponse<DisputeAPIResponse>> {
  try {
    const accessToken = await getCurrentAccessToken() // Ensure to populate this with a valid token
    const response = await cjApiClient.post<DisputeAPIResponse>('disputes/create', requestData, {
      headers: {
        'CJ-Access-Token': accessToken,
      },
    })

    if (!response.data.result) {
      return {
        error: response.data.message || 'Failed to create dispute',
      }
    }

    return { data: response.data }
  } catch (error: any) {
    console.error(`Error creating dispute [${error.code}]: ${error.message}`)
    return { error: error.message || 'An unknown error occurred' }
  }
}

export async function confirmDispute(
  requestData: ConfirmDisputeRequest,
): Promise<APIResponse<ConfirmDisputeResponse>> {
  try {
    const accessToken = await getCurrentAccessToken() // Ensure to populate this with a valid token
    const response = await cjApiClient.post<ConfirmDisputeResponse>(
      'disputes/disputeConfirmInfo',
      requestData,
      {
        headers: {
          'CJ-Access-Token': accessToken,
        },
      },
    )

    if (!response.data.result) {
      return {
        error: response.data.message || 'Failed to confirm dispute',
      }
    }

    return { data: response.data }
  } catch (error: any) {
    console.error(`Error confirming dispute [${error.code}]: ${error.message}`)
    return { error: error.message || 'An unknown error occurred' }
  }
}
