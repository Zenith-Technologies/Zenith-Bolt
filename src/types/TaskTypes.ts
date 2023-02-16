export interface ITaskStorage {
    [key: string]: ITask
}

export interface ITask extends ITaskOptions{
    id: string,
    status: "created" | "stopped" | "starting" | "monitoring" | "processing" | "waiting" | "successful" | "failed" | "error"
}

export interface ITaskOptions {
    wallet: string,
    group: string,
    mode: TaskModeOptions,
    transaction: TransactionOptions
}

export type TaskModeOptions = {
    type: "follow",
    addressToWatch: string,
    destinationToWatch: string,
    dataToWatch: string,
    firstBlockMint: RetryOptions,
    safeMint: boolean
} | {
    type: "timestamp",
    timestamp: number,
    safeMint: boolean
} | {
    type: "custom",
    moduleData: string,
    safeMint: boolean
}

export interface TransactionOptions {
    rpc: string,
    additionalRPCs: string[],
    gas: GasOptions,
    nonce?: number,
    data: string,
    value: number
}

export type TaskMetadata = {
    type: "follow",
    followingTransaction: string,
    transactionHashesSent: string[]
} | {
    type: "timestamp",
    attemptedOnBlock: boolean,
    transactionHashesSent: string[]
} | {
    type: "custom"
}

type GasOptions = {
    type: "auto",
    gasFactor: number,
    gasLimit?: number
} | {
    type: "provided",
    maxPriorityFeePerGas: number,
    maxFeePerGas: number,
    gasLimit?: number
}

type RetryOptions = {attemptMint: false} | {
        attemptMint: true,
        attemptGasLimit: number,
        retryIfFailed: boolean
    }