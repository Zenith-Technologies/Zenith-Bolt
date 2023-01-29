import {EventEmitter} from "events";
import {ITask} from "../types/TaskTypes";
import {IMintTaskOptions} from "../types/TaskOptionTypes";
import {IMintFollowOptions} from "../types/TaskMonitorTypes";

export class FollowMonitorSubscription extends EventEmitter {

    private taskSettings: IMintTaskOptions;
    private monitorSettings: IMintFollowOptions;
    private task: ITask;

    constructor(task: ITask){
        super();

        this.taskSettings = task.taskSettings as IMintTaskOptions;
        this.monitorSettings = this.taskSettings.monitorSettings as IMintFollowOptions;
        this.task = task;

    }

}