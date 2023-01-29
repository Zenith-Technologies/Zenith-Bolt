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