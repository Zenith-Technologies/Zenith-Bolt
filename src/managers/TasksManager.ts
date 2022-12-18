export interface ITask extends ITaskOptions{
    status: string
}

export interface ITaskOptions {
    accounts: string[]
    group: number,
    taskSettings: IMintTaskOptions | ICustomModuleTaskOptions,
    transactonSettings: ITransactionSettingsOptions
}
interface ITransactionSettingsOptions {
    nodes: string[],
    gas: {
        mode: "auto" | "provided",
        maxCostPerGas: number
        gasFactor: number
    }
}

interface ICustomModuleTaskOptions {
    module: string,
    data: string
}

interface IMintTaskOptions {
    data: string,
    price: number,
    quantity: number,
    modeSettings: IMintFollowOptions | IMintTimestampOptions
}

interface IMintFollowOptions {
    mode: "follow",
    data: string,
    address: string,
    waitForBlock: RetryOptions | true
}

interface IMintTimestampOptions {
    mode: "timestamp",
    timestamp: number,
    waitForBlock: RetryOptions | true
}

interface RetryOptions {
    retryOnFail: boolean
}