import {ITask, ITaskOptions, ITaskStorage, TaskMetadata} from "../types/TaskTypes";
import {ConfigModel} from "../models/ConfigModel";
import {nanoid} from "nanoid";

export class TasksService {

    private static tasks: ITaskStorage;
    private static taskMetadata: {
        [key: string]: TaskMetadata
    }

    constructor() {
        for(let task of Object.values(ConfigModel.getTasks())){
            task.status = "created";
            TasksService.tasks[task.id] = task;

            // Set metadata
            this.setDefaultMetadata(task);
        }
    }

    static create(options: ITaskOptions): ITask {
        const task: ITask = {
            id: nanoid(),
            status: "created",
            ...options
        }

        return task;
    }

    static get(id: string): ITask | undefined{
        return this.tasks[id];
    }

    static getMetadata(id: string): TaskMetadata{
        return this.taskMetadata[id];
    }

    static upsertMetadata(id: string, metadata: Partial<TaskMetadata>) {
        const meta = this.getMetadata(id);

        Object.assign(meta, metadata);
    }

    /*
    Default metadata ops
     */
    private setDefaultMetadata(task: ITask){
        if(task.mode.type === "timestamp"){
            this.setDefaultTimestampMetadata(task);
        }else if(task.mode.type === "follow"){
            this.setDefaultFollowMetadata(task);
        }else if(task.mode.type === "custom"){
            this.setDefaultCustomMetadata(task);
        }
    }

    private setDefaultTimestampMetadata(task: ITask){
        TasksService.taskMetadata[task.id] = {
            type: "timestamp",
            attemptedOnBlock: false,
            transactionHashesSent: []
        }
    }

    private setDefaultFollowMetadata(task: ITask) {
        TasksService.taskMetadata[task.id] = {
            type: "follow",
            followingTransaction: "",
            transactionHashesSent: []
        }
    }

    private setDefaultCustomMetadata(task: ITask) {
        TasksService.taskMetadata[task.id] = {
            type: "custom"
        }
    }

}