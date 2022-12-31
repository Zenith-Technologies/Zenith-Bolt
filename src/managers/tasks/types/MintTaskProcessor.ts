import groupsManager, {IGroup} from "../../GroupsManager";
import axios from "axios";
import monitorManager from "../MonitorManager";
import {
    IMintFollowOptions,
    IMintTask,
    IMintTimestampOptions,
    ITask,
    IWatchTaskOptions, RetryOptions
} from "../../../definitions/tasks/TaskTypes";

export class MintTaskProcessor {
    private task: IMintTask;
    private group: IGroup | null;

    constructor(task: ITask) {
        this.task = task as IMintTask;
        this.group = null;
    }

    startTask(): boolean{
        this.group = groupsManager.getGroup(this.task.group);
        if(this.group == null) return false;

        if(this.task.taskSettings.monitorSettings.mode === "timestamp"){
            this.setUpBlockTimeout();
        }else if(this.task.taskSettings.monitorSettings.mode === "follow"){
            const taskSettings = this.task.taskSettings.monitorSettings as IMintFollowOptions;

            const monitorOptions: IWatchTaskOptions = {
                contract: taskSettings.toAddress,
                owner: taskSettings.fromAddress,
                data: taskSettings.data
            }

            monitorManager.addMonitorTask(this.pendingReceived, "watch", monitorOptions);
        }
        return true;
    }

    setUpBlockTimeout(){
        const settings = this.task.taskSettings.monitorSettings as IMintTimestampOptions;

        const delay = (settings.timestamp-(Date.now()/1000)) * 1000;

        setTimeout(() => {

        }, delay);
        monitorManager.addMonitorTask(this.firstBlockReceived, "block");
    }

    firstBlockReceived(){
        const settings = this.task.taskSettings.monitorSettings as IMintTimestampOptions;
        if(settings.waitForBlock === true){

        } else{
            const retrySettings = settings.waitForBlock as RetryOptions;


        }
    }

    pendingReceived(){
        const settings = this.task.taskSettings.monitorSettings as IMintFollowOptions;
    }

    confirmedReceived(){

    }

    sendTransaction(){

    }
}