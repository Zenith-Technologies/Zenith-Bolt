import {ICustomModuleTaskOptions, IMintTaskOptions} from "./TaskOptionTypes";
import {IStatus} from "./TaskStatusTypes";
import {ITransactionSettingsOptions} from "./TransactionSettingsTypes";

export interface IMintTask extends ITask {
    taskSettings: IMintTaskOptions
}

export interface ICustomTask extends ITask {
    taskSettings: ICustomModuleTaskOptions
}

export interface ITask extends ITaskOptions {
    id: string,
    status: IStatus
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