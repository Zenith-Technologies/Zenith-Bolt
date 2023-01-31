import {EventEmitter} from "events";
import {ITask} from "../types/TaskTypes";
import {IMintTaskOptions} from "../types/TaskOptionTypes";
import {IMintFollowOptions} from "../types/TaskMonitorTypes";
import axios from "axios/index";
import {MONITOR_URL} from "../utils/Constants";
import {WebSocket} from "ws";
import {FollowAPIService} from "../services/FollowAPIService";

export class FollowMonitorSubscription extends EventEmitter {

    private taskSettings: IMintTaskOptions;
    private monitorSettings: IMintFollowOptions;
    private task: ITask;

    constructor(task: ITask, monitorTask: string){
        super();

        this.taskSettings = task.taskSettings as IMintTaskOptions;
        this.monitorSettings = this.taskSettings.monitorSettings as IMintFollowOptions;
        this.task = task;
    }

    // TODO Refactor this into it's own service


}