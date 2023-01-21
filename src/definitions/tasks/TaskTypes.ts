// All possible task statuses
export type IStatus = "created" | "stopped" | "starting" | "monitoring" | "processing" | "waiting" | "successful" | "failed" | "error";

// Completed task interface (has ID and status)
export interface ITask extends ITaskOptions{
    id: string,
    status: IStatus
}

export interface ICustomModuleTask extends ITask {
    taskSettings: ICustomModuleTaskOptions
}

export interface IMintTask extends ITask {
    taskSettings: IMintTaskOptions
}

export interface ITaskOptions {
    // Account ID to run task for
    account: string,
    // Group ID task belongs to
    group: string,
    // Task settings
    taskSettings: ICustomModuleTaskOptions | IMintTaskOptions,
    // Txn send settings
    transactionSettings: ITransactionSettingsOptions
}

export interface ITransactionSettingsOptions {
    // List of RPC node IDs to send txn through
    nodes: string[],
    // Gas settings
    gas: IGasAutoOptions | IGasProvidedOptions,
    // Whether to automatically calculate gas
    autoGas: boolean,
    // Transaction nonce
    nonce?: number,
    // Transaction gas limit
    gasLimit?: number
}

export interface IGasAutoOptions {
    mode: "auto",
    // Maximum cost per gas estimated (after gasFactor)
    maxCostPerGas: number,
    // Amount to multiply estimate by
    gasFactor: number
}

export interface IGasProvidedOptions {
    mode: "provided",
    // Priority fee to send with txn
    priorityFee: number,
    // Max fee to send with txn
    maxFeePerGas: number
}

export interface ICustomModuleTaskOptions {
    // Name of module to run
    module: string,
    // Data to pass to module
    data: string
}

export interface IMintTaskOptions {
    // Data to send with txn
    data: string,
    // Price to send with txn
    price: number,
    // Monitor settings
    monitorSettings: IMintFollowOptions | IMintTimestampOptions
}

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

export interface IWatchTaskOptions {
    contract: string,
    owner: string,
    data: string
}