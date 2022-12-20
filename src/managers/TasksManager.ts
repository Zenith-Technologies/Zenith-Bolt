import {IGroup} from "./GroupsManager";
import {TaskProcessManager} from "./TaskProcessManager";
import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";
import socketServer, {UpdateMessage} from "../servers/SocketServer";

export interface ITaskOptions {
    target: string,
    group: number,
    settings: IMintTaskOptions
}

export type IStatus = "stopped" | "starting" | "monitoring" | "processing" | "waiting" | "successful" | "failed" | "error";

export interface ITask extends ITaskOptions{
    id: string,
    status: IStatus
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
    type: "custom",
    module: string,
    data: string
}

interface IMintTaskOptions {
    type: "mint",
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