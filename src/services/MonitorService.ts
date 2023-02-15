import {ITask} from "../types/TaskTypes";
import {FlashMonitorClient} from "../clients/FlashMonitorClient";
import {IMonitorTask, IMonitorTaskOptions} from "../types/TaskMonitorTypes";
import {ethers} from "ethers";
import {EventEmitter} from "events";
import {RPCEmitter} from "../emitters/RPCEmitter";

export class MonitorService {
    constructor() {
    }

    /*
    Typescript header functions
     */
    static async monitor(task: ITask): Promise<{
        task: IMonitorTask,
        emitter: EventEmitter
    } | false>;

    static async monitor(task: ITask, emitter: RPCEmitter): Promise<boolean>;

    /*
    Implementation
     */
    static async monitor(task: ITask, emitter?: RPCEmitter) {
        if(task.mode.type === "follow"){
            return this.createFollowMonitor(task);
        }else if(task.mode.type === "timestamp"){
            if(emitter == null) return false;
            return this.createTimestampMonitor(task, emitter);
        }else if(task.mode.type === "custom"){

        }else{
            // THROW ERROR
            throw new Error("bruv")
        }
    }

    static async unmonitor(taskId: string) {
        // TODO Cancel monitoring task
    }

    /*
    Implementation functions
     */

    private static async createFollowMonitor(task: ITask): Promise<{
        task: IMonitorTask,
        emitter: EventEmitter
    } | false> {
        if(task.mode.type !== "follow") return false; /* this isnt possible */
        const monitorTask: IMonitorTaskOptions = {
            contract: task.mode.destinationToWatch,
            owner: task.mode.addressToWatch,
            data: task.mode.dataToWatch
        }

        return await FlashMonitorClient.follow(monitorTask);
    }

    private static createTimestampMonitor(task: ITask, emitter: RPCEmitter): Promise<boolean> {
        let finalizeNextBlock = false;

        // We need a promise instead of async because typescript aint smart enough for this shit
        return new Promise<boolean>((resolve, reject) => {
            /* this will never happen just need it for type infer */
            if(task.mode.type !== "timestamp"){
                reject(false);
                return;
            }

            // First, check the timestamp
            if(task.mode.timestamp < Math.floor(Date.now()/1000)){
                // Run instantly
                resolve(true);
                return;
            }
            // Listener function (so we can remove l8r)
            const listener = (block: ethers.providers.Block) => {
                /* this will never happen just need it for type infer */
                if(task.mode.type !== "timestamp"){
                    reject(false);
                    return;
                }

                // If we decided to go next block, this handles that
                if(finalizeNextBlock){
                    emitter.removeListener("fullBlock", listener);
                    resolve(true)
                    return;
                }

                if(block.timestamp + 12 > task.mode.timestamp){
                    // Check if we safe mint or just go
                    if(!task.mode.safeMint && task.transaction.gas.gasLimit != null){
                        // We go now
                        emitter.removeListener("fullBlock", listener);
                        resolve(true);
                        return;
                    }else {
                        // Wait until next block (estimateGas should work)
                        finalizeNextBlock = true;
                        return;
                    }
                }
            }

            // Subscribe to blocks
            emitter.on("fullBlock", listener);
        });
    }
}

new MonitorService();