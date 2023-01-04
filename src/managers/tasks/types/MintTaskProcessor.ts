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
import {BlockObject} from "../../monitors/BlockMonitor";
import {Monitor} from "../../monitors/Monitor";
import {ethers} from "ethers";

export class MintTaskProcessor {
    private task: IMintTask;
    private group: IGroup | null;
    private currentTransaction: ethers.providers.TransactionResponse | null;

    constructor(task: ITask) {
        this.task = task as IMintTask;
        this.group = null;
        this.currentTransaction = null;
    }

    startTask(): boolean{
        this.group = groupsManager.getGroup(this.task.group);
        if(this.group == null) return false;

        if(this.task.taskSettings.monitorSettings.mode === "timestamp"){
            Monitor.block.on("block", (block: BlockObject) => {
                this.blockReceived(block);
            })
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

    blockReceived(block: BlockObject){
        const settings = this.task.taskSettings.monitorSettings as IMintTimestampOptions;
        if(block.timestamp + 12 > settings.timestamp){
            if(this.currentTransaction === null) {
                // We are ready to start sending transactions
            }else{
                // We need to update transaction gas if option is enabled
            }
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