import {EventEmitter} from "events";
import {TaskProcessor, WatchTaskMessage} from "../../../src/definitions/tasks/TaskProcessor";
import {IMintFollowOptions, IStatus, ITask} from "../../../src/definitions/tasks/TaskTypes";
import groupsManager, {IGroup} from "../../../src/controllers/GroupsController";
import {Monitor} from "../../monitor/Monitor";
import {FollowCheckoutProcessor} from "../../checkout/FollowCheckoutProcessor";
import {BlockMessage} from "../../monitor/BlockMonitor";

export class WatchMintProcessor extends EventEmitter implements TaskProcessor {
    private task: ITask;
    private group: IGroup | null;
    private status: IStatus;
    private checkoutProcessor: FollowCheckoutProcessor | null;

    constructor(task: ITask) {
        super();

        this.task = task;
        this.group = null;
        this.status = "created";
        this.checkoutProcessor = null;

        Monitor.block.on("block", (block: BlockMessage) => {
            if(this.checkoutProcessor){
                this.checkoutProcessor.handleNewBlock(block.block);
            }
        })
    }

    async startTask(): Promise<boolean> {
        this.group = groupsManager.getGroup(this.task.group);
        if(this.group == null) return false;

        if(this.task.taskSettings.type === "custom") return false;
        const monitorSettings = this.task.taskSettings.monitorSettings as IMintFollowOptions;
        const followSettings = {
            contract: monitorSettings.toAddress,
            owner: monitorSettings.fromAddress,
            data: monitorSettings.data
        }

        const taskId = await Monitor.watch.startWalletMonitoring(followSettings);

        if(taskId === false){
            console.log("Wallet monitor failed")
            return false;
        }

        console.log("created task with id:", taskId);

        Monitor.watch.on(taskId, (data: WatchTaskMessage) => {
            console.log("watch data", data);
            if(data.stage === "pending"){
                console.log("pending stage", monitorSettings.waitForBlock !== true, monitorSettings.gasLimit);
                if(monitorSettings.waitForBlock !== true && monitorSettings.gasLimit){
                    console.log("running checkout processor");
                    this.checkoutProcessor = new FollowCheckoutProcessor(this.task, <IGroup>this.group);
                    this.checkoutProcessor.createMatchTransaction(data);
                }
            }else if(data.stage === "confirmed"){
                if(this.checkoutProcessor == null){
                    this.checkoutProcessor = new FollowCheckoutProcessor(this.task, <IGroup>this.group);
                }
                this.checkoutProcessor.createMintTransaction(data);
            }
        })

        return false;
    }

    async stopTask(): Promise<boolean> {
        return false;
    }

    getStatus(): IStatus {
        return this.status;
    }
}