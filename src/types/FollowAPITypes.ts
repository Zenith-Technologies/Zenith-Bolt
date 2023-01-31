export interface FollowAPIMessage {
    id: string,
    stage: "pending" | "confirmed",
    block: number,
    gas: {
        maxPriorityFeePerGas: number,
        maxFeePerGas: number
    }
}

export interface FollowAPITask {
    contract: string,
    owner: string,
    data: string
}