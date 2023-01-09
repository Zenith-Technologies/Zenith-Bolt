interface SucceededResponse {
    success: true
}

interface FailedResponse {
    success: false,
    message: string
}

export type SuccessResponse = SucceededResponse | FailedResponse;