import {
    IMintFollowOptions,
    IMintTask,
    IMintTimestampOptions, IStatus,
    ITask,
    IWatchTaskOptions,
} from "../../../definitions/tasks/TaskTypes";
import {ethers} from "ethers";
import groupsManager, {IGroup} from "../../../controllers/GroupsController";
import { Monitor } from "../../monitor/Monitor";
import {TaskProcessor} from "../../../definitions/tasks/TaskProcessor";
import {EventEmitter} from "events";
import {TimestampCheckoutProcessor} from "../../checkout/TimestampCheckoutProcessor";
import {BlockMessage, BlockObject} from "../../monitor/BlockMonitor";

export class TimestampMintProcessor extends EventEmitter implements TaskProcessor {
    private task: IMintTask;
    private group: IGroup | null;
    private status: IStatus;
    private transaction: TimestampCheckoutProcessor | null;

    constructor(task: ITask) {
        super();

        this.task = task as IMintTask;
        this.group = null;
        this.status = "created";
        this.transaction = null;
        this.emitStatus("created");
    }

    async startTask(): Promise<boolean>{
        this.group = groupsManager.getGroup(this.task.group);
        if(this.group == null) return false;

        Monitor.block.on("block", (block: BlockMessage) => {
            this.blockReceived(block.block);
            if(this.transaction){
                this.transaction.handleNewBlock(block.block);
            }
        })

        return true;
    }

    async stopTask(): Promise<boolean> {
        return true;
    }

    getStatus(): IStatus {
        return this.status;
    }

    blockReceived(block: BlockObject){
        this.emitStatus("monitoring");
        const settings = this.task.taskSettings.monitorSettings as IMintTimestampOptions;
        const attemptFirstBlock = settings.attemptFirstBlock && settings.firstBlockGasLimit;
        if((block.timestamp + 12 > settings.timestamp && attemptFirstBlock) || (block.timestamp > settings.timestamp && !attemptFirstBlock) && this.transaction == null){
            // Ready to send transactions
            this.transaction = new TimestampCheckoutProcessor(this.task, this.group as IGroup, block.timestamp);
            this.emitStatus("processing");
            this.transaction.createTransactionObject();

            this.transaction.on("sent", () => {
                this.emitStatus("waiting");
            })

            this.transaction.on("mined", () => {
                this.emitStatus("successful");
            })
        }
    }

    private emitStatus(status: IStatus){
        // name, task object, old status, new status
        this.emit("update", this.task, this.status, status);

        this.status = status;
    }
}