import {IGroup} from "./GroupsManager";
import {TaskProcessManager} from "./tasks/TaskProcessManager";
import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";
import socketServer, {UpdateMessage} from "../servers/SocketServer";
import {ITask, ITaskOptions} from "../definitions/tasks/TaskTypes";

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