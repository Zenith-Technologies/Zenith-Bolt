export interface IMintFollowOptions {
    mode: "follow",
    // Data to monitor for in txn
    data: string,
    // Address to monitor txns from
    fromAddress: string,
    // Address to monitor txns to (if from fromAddress)
    toAddress: string,
    // Retry behavior
    waitForBlock: RetryOptions | true,
    gasLimit?: number
}

export interface IMintTimestampOptions {
    mode: "timestamp",
    // Timestamp to send txn at
    timestamp: number,
    // Should bot attempt minting first valid block
    attemptFirstBlock?: boolean,
    // Gas limit for first block
    firstBlockGasLimit?: number
}

export interface RetryOptions {
    retryOnFail: boolean
}