import {ITask, ITaskStorage, TaskMetadata} from "../types/TaskTypes";
import {ConfigModel} from "../models/ConfigModel";

export class TasksService {

    private static tasks: ITaskStorage;
    private static taskMetadata: {
        [key: string]: TaskMetadata
    }

    constructor() {
        for(let task: ITask of ConfigModel.getTasks()){
            task.status = "created";
            TasksService.tasks[task.id] = task;
        }
    }

    static get(id: string): ITask | undefined{
        return this.tasks[id];
    }

    static getMetadata(id: string): TaskMetadata | undefined{
        return this.taskMetadata[id];
    }

    static upsertMetadata(id: string, metadata: TaskMetadata) {
        this.taskMetadata[id] = metadata;
    }

}