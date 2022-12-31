import config from "../../utils/StorageHandler";
import {EventEmitter} from "events";
import {ITask} from "../../definitions/tasks/TaskTypes";

export class TaskProcessManager extends EventEmitter{
    private task: ITask;

    constructor(task: ITask){
        super();
        this.task = task;
        config.set(`tasks.${this.task.id}`, this.task);
    }

    startTask(){
        if(this.task.taskSettings.type === "mint"){

        }else if(this.task.taskSettings.type === "custom"){

        }else{
            this.emit("update", {
                group: this.task.group,
                task: this.task.id,
                oldStatus: this.task.status,
                newStatus: "error"
            })
            this.task.status = "error";
            return;
        }
    }

    stopTask(){

    }

    deleteTask(){
        config.delete(`tasks.${this.task.id}`);
    }
}