import {IGroup} from "./GroupsManager";
import {TaskProcessManager} from "./tasks/TaskProcessManager";
import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";
import socketServer, {UpdateMessage} from "../servers/SocketServer";

// All possible task statuses
export type IStatus = "stopped" | "starting" | "monitoring" | "processing" | "waiting" | "successful" | "failed" | "error";

// Completed task interface (has ID and status)
export interface ITask extends ITaskOptions{
    id: string,
    status: IStatus
}

export interface ITaskOptions {
    // Account ID to run task for
    account: string,
    // Group ID task belongs to
    group: number,
    // Task settings
    taskSettings: IMintTaskOptions | ICustomModuleTaskOptions,
    // Txn send settings
    transactonSettings: ITransactionSettingsOptions
}
interface ITransactionSettingsOptions {
    // List of RPC node IDs to send txn through
    nodes: string[],
    // Gas settings
    gas: IGasAutoOptions | IGasProvidedOptions
}

interface IGasAutoOptions {
    mode: "auto",
    // Maximum cost per gas estimated (after gasFactor)
    maxCostPerGas: number,
    // Amount to multiply estimate by
    gasFactor: number
}

interface IGasProvidedOptions {
    mode: "provided",
    // Priority fee to send with txn
    priorityFee: number,
    // Max fee to send with txn
    maxFeePerGas: number
}

interface ICustomModuleTaskOptions {
    type: "custom",
    // Name of module to run
    module: string,
    // Data to pass to module
    data: string
}

interface IMintTaskOptions {
    type: "mint",
    // Data to send with txn
    data: string,
    // Price to send with txn
    price: number,
    // Monitor settings
    monitorSettings: IMintFollowOptions | IMintTimestampOptions
}

interface IMintFollowOptions {
    mode: "follow",
    // Data to monitor for in txn
    data: string,
    // Address to monitor txns from
    fromAddress: string,
    // Address to monitor txns to (if from fromAddress)
    toAddress: string,
    // Retry behavior
    waitForBlock: RetryOptions | true
}

interface IMintTimestampOptions {
    mode: "timestamp",
    // Timestamp to send txn at
    timestamp: number,
    waitForBlock: RetryOptions | true
}

interface RetryOptions {
    retryOnFail: boolean
}

interface ITasksStored {
    [key: string]: TaskProcessManager
}

interface ITasksSaved {
    [key: string]: ITask
}

class TasksManager{
    private tasks: ITasksStored;
    constructor() {
        this.tasks = {};
        if(config.has("tasks")) {
            // Make sure groups and groups id is good
            const configTasks: ITasksSaved = config.get("tasks") as ITasksSaved;
            // Delete all groups and group ID if stored incorrectly
            if(configTasks == null) {
                config.delete("tasks");
                return;
            }
            // Load from config
            for (let key of Object.keys(configTasks)) {
                const taskProcess = new TaskProcessManager(configTasks[key]);
                this.tasks[key] = taskProcess;

                taskProcess.on("update", this.handleUpdate);
            }
        }
    }

    createTask(task: ITaskOptions){
        const taskId = nanoid();
        const fullTask: ITask = {
            status: "stopped",
            id: taskId,
            ...task
        }

        const taskProcess = new TaskProcessManager(fullTask);
        this.tasks[taskId] = taskProcess;

        taskProcess.on("update", this.handleUpdate);
    }

    deleteTask(taskId: string) {
        this.tasks[taskId].deleteTask();

        delete this.tasks[taskId];
    }

    private handleUpdate(update: UpdateMessage){
        socketServer.emitUpdate(update);
    }

}