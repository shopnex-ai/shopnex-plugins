/**
 * API Response Structure
 */
export type APIResponse<T> =
    | { data: T; error?: never }
    | { data?: never; error: string };

/**
 * API Error Response Structure
 */
export interface ApiResponseError {
    code: number;
    result: boolean;
    message: string;
    data: null;
    requestId: string;
}
