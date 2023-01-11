import config from "../../src/utils/StorageHandler";
import {EventEmitter} from "events";
import {IStatus, ITask, ITaskOptions} from "../../src/definitions/tasks/TaskTypes";
import {TaskProcessor} from "../../src/definitions/tasks/TaskProcessor";
import {TimestampMintProcessor} from "./types/TimestampMintProcessor";
import {nanoid} from "nanoid";
import {WatchMintProcessor} from "./types/WatchMintProcessor";

class TaskProcessManager extends EventEmitter{
    private taskProcessors: {
        [key: string]: TaskProcessor
    }

    constructor(){
        super();
        this.taskProcessors = {};
    }

    createTask(taskOptions: ITaskOptions): ITask{
        const task: ITask = {
            id: nanoid(),
            status: "created",
            ...taskOptions
        }

        config.set(`tasks.${task.id}`, task);
        if(task.taskSettings.type === "mint"){
            // Determine what type of mint task
            if(task.taskSettings.monitorSettings.mode === "timestamp"){
                const processor = new TimestampMintProcessor(task)
                this.taskProcessors[task.id] = processor;

                processor.on("update", (task: ITask, oldStatus: IStatus, newStatus: IStatus) => {
                    this.handleStatusUpdate(task, oldStatus, newStatus);
                });
            }else if(task.taskSettings.monitorSettings.mode === "follow"){
                // WatchMintProcessor create here
                const processor = new WatchMintProcessor(task)
                this.taskProcessors[task.id] = processor;

                processor.on("update", (task: ITask, oldStatus: IStatus, newStatus: IStatus) => {
                    this.handleStatusUpdate(task, oldStatus, newStatus);
                });
            }
        }else if(task.taskSettings.type === "custom"){
            // CustomTaskProcessor create here
        }

        return task;
    }
    startTask(task: ITask | string){
        let taskId;

        // Set task ID depending on type passed in
        if(typeof task === "string"){
            taskId = task;
        }else{
            taskId = task.id;
        }

        this.taskProcessors[taskId].startTask();
    }

    async deleteTask(task: ITask | string): Promise<boolean>{
        let taskId;

        // Set task ID depending on type passed in
        if(typeof task === "string"){
            taskId = task;
        }else{
            taskId = task.id;
        }

        await this.taskProcessors[taskId].stopTask();
        await config.delete(`tasks.${taskId}`);
        return true;
    }

    handleStatusUpdate(task: ITask, oldStatus: IStatus, newStatus: IStatus){
        // Bubble the event up to the WebSocket
        this.emit("update", task, oldStatus, newStatus);
    }
}

const taskManager = new TaskProcessManager();

export default taskManager;