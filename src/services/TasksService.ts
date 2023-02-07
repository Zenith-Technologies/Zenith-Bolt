import {ITask, ITaskStorage} from "../types/TaskTypes";
import {ConfigModel} from "../models/ConfigModel";

export class TasksService {

    private static tasks: ITaskStorage;

    constructor() {
        for(let task: ITask of ConfigModel.getTasks()){
            task.status = "created";
            TasksService.tasks[task.id] = task;
        }
    }

    static get(id: string): ITask | undefined{
        return this.tasks[id];
    }

}