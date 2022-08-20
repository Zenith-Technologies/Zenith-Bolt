export interface RawTask {
    target: string,
    type: "opensea" | "mint",
    group: string,
    typeSettings: {
        mode: "follow" | "timestamp",
        modeSettings: {
            ownerAddress: string,
            monitorContract: string | null,
            functionName: string,
            matchOwnerTransaction: boolean,
            retryFailedMatchTransaction: boolean,
        },
        transactionSettings:{
            transactionData: string,
            mintPrice: number,
            mintQuantity: number
        },
        gasSettings: {
            priorityFee: number | null,
            maxFeePerGas: number | null,
            gasLimit: number | null,
        }
    }
}