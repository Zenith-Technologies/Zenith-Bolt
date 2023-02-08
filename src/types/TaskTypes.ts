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
    firstBlockMint: RetryOptions
} | {
    type: "timestamp",
    timestamp: number,
    firstBlockMint: RetryOptions
} | {
    type: "custom",
    moduleData: string
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
    type: "timestamp"
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