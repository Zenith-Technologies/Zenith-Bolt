// Receives all task routes
import {ITask, ITaskOptions, TaskMetadata, TaskModeOptions} from "../types/TaskTypes";
import {MonitorService} from "../services/MonitorService";
import {TasksService} from "../services/TasksService";
import axios from "axios";
import {TransactionBuilderService} from "../services/TransactionBuilderService";
import {IMonitorClientMessage} from "../types/TaskMonitorTypes";
import {GroupsService} from "../services/GroupsService";
import {RPCService} from "../services/RPCService";
import {WalletsService} from "../services/WalletsService";
import {ethers} from "ethers";
import {TransactionSenderService} from "../services/TransactionSenderService";
import {TransactionTestingService} from "../services/TransactionTestingService";

export class TasksController {

    static create(taskOptions: ITaskOptions){

    }

    static async start(taskId: string){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");

        // TODO Return {taskStatus: started} or whatever here
        // task.status = "started";
        // res.send(JSON.stringify(task));

        if(task.mode.type === "follow"){
            this.startFollowTask(taskId, task);
        }else if(task.mode.type === "timestamp"){
            this.startTimestampTask(taskId, task);
        }else if(task.mode.type === "custom"){

        }else{
            // THROW ERROR - SHOULD NEVER HAPPEN
        }
    }

    static async stop(taskId: string){

    }

    static async status(taskId: string){

    }

    /*
    Follow transaction functions below
     */

    // Starts the monitor process
    private static async startFollowTask(taskId: string, task: ITask){
        const monitor = await MonitorService.monitor(task);

        if(monitor == null || monitor === false) throw new Error("failed monitoring");

        monitor.emitter.on("message", (data: IMonitorClientMessage) => {
            if (data.stage === "pending") {
                // TODO Convert this to a request
                this.createFollowTransaction(taskId, data);
            }
        });
    }

    // Builds a transaction given a message from the monitor and a task ID (follow)
    private static async createFollowTransaction(taskId: string, txnData: IMonitorClientMessage){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const group = GroupsService.get(task.group);
        const rpc = RPCService.get(task.transaction.rpc);
        const wallet = WalletsService.getWallet(task.wallet);

        // Set metadata
        let metadata = TasksService.getMetadata(taskId);
        if(metadata.type !== "follow"){
            TasksService.upsertMetadata(taskId, {
                followingTransaction: txnData.hash
            });
        }else {
            metadata.followingTransaction = txnData.hash;
        }

        // Now we have to decide if we send the transaction or skip it
        if(task.mode.safeMint){
            // Skip it (minting isn't "guaranteed" so its not safe)
            await this.waitForFollowTransaction(taskId);
            return;
        }


        let toSend = await TransactionBuilderService.build(task, group, rpc, wallet, txnData);

        // TODO turn this into a request (TransactionRequest is JSON.stringify-able)
        this.sendFollowTransaction(taskId, toSend);
    }

    // Sends a transaction given a task ID and data to send
    private static async sendFollowTransaction(taskId: string, txnData: ethers.providers.TransactionRequest){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const wallet = WalletsService.getWallet(task.wallet);
        const mainRPC = RPCService.get(task.transaction.rpc);
        const additionalRPCs = [];

        for(let rpcId of task.transaction.additionalRPCs){
            additionalRPCs.push(RPCService.get(rpcId));
        }

        const hashes = await TransactionSenderService.send(task, wallet, mainRPC, additionalRPCs, txnData);

        // Do metadata changes
        const metadata = TasksService.getMetadata(taskId);
        if(metadata == null) return;
        if(metadata.type !== "follow") return;
        metadata.transactionHashesSent.push(...hashes);

        // TODO turn this to a request
        this.waitForFollowTransaction(taskId);
    }

    static async waitForFollowTransaction(taskId: string){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const metadata = TasksService.getMetadata(taskId);
        if(metadata == null) throw new Error("Call stack weird");
        if(metadata.type !== "follow") throw new Error("Call stack weirder");

        const wallet = WalletsService.getWallet(task.wallet);
        const mainRPC = RPCService.get(task.transaction.rpc);

        // I don't know if this should be in the controller since this is *technically* business logic, but I'll let danny decide if it is and where it goes
        const provider = mainRPC.emitter.getProvider();

        provider.once("fullblock", async (block: ethers.providers.Block) => {
            // These variables will track how the task is going after the loops process
            let taskStatus: "waiting" | "mined" | "minedEarly" | "notMined" = "waiting";
            let transactionHash: string = "";

            if(block.transactions.includes(metadata.followingTransaction)){
                if(task.mode.safeMint){
                    // Now the follow txn went through, now we can check for mint safety (notMined performs the same thing)
                    taskStatus = "notMined";
                }else {
                    // Transaction we were following has been mined, let's see if our transactions made it
                    for (let txn of metadata.transactionHashesSent) {
                        if (block.transactions.includes(txn)) {
                            // A transaction confirmed before ours made it - task success
                            taskStatus = "mined";
                            transactionHash = txn;
                        }
                    }

                    // If after the loop status hasn't changed, we didn't get mined
                    if (taskStatus === "waiting") {
                        taskStatus = "notMined";
                    }
                }
            }else{
                // Follow transaction still pending, make sure none of the ones we sent made it through
                for(let txn of metadata.transactionHashesSent){
                    if(block.transactions.includes(txn)){
                        // A transaction confirmed before the follow txn made it - task failed
                        taskStatus = "minedEarly";
                        transactionHash = txn;
                    }
                }
            }

            if(taskStatus === "mined"){
                // Now we need to verify the transaction actually succeeded
                const receipt = await provider.getTransactionReceipt(transactionHash);

                if(receipt.status === 1){
                    // Transaction did not revert, assume success
                }else if(receipt.status === 0){
                    // Transaction reverted, assume failure
                }else{
                    // Something weird happened
                }
            }else if(taskStatus === "minedEarly"){
                // Our transaction mined BEFORE the following transaction - retry transaction after its confirmed
            }else if(taskStatus === "notMined"){
                // Our transaction didn't get mined - simply resend it
            }else{
                // We check to ensure the edge case here where the user-provided RPC has slow delivery and the txn has been mined already
            }
        });
    }

    /*
    Timestamp functions
     */

    private static async startTimestampTask(taskId: string, task: ITask) {
        if(task.mode.type !== "timestamp") return;
        const emitter = RPCService.get(task.transaction.rpc).emitter;

        MonitorService.monitor(task, emitter).then(() => {
            // TODO Turn this into a request
            this.createTimestampTransaction(taskId);
        })
    }

    private static async createTimestampTransaction(taskId: string){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const group = GroupsService.get(task.group);
        const rpc = RPCService.get(task.transaction.rpc);
        const wallet = WalletsService.getWallet(task.wallet);

        if(task.mode.type !== "timestamp") return; /* once again, type inference */

        if(task.mode.safeMint){
            const isSafe = await TransactionTestingService.checkValidity(task, group, rpc);
            if(!isSafe){
                rpc.emitter.once("block", () => {
                    // Retry this method on next block
                    // TODO Convert this to a request
                    this.createTimestampTransaction(taskId);
                })
                return;
            }
        }

        // We've done any checks needed, good to launch
        const txnData = await TransactionBuilderService.build(task, group, rpc, wallet);

        // TODO Convert this to a request
        this.sendTimestampTransaction(taskId, txnData);
    }

    private static async sendTimestampTransaction(taskId: string, txnData: ethers.providers.TransactionRequest){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const wallet = WalletsService.getWallet(task.wallet);
        const mainRPC = RPCService.get(task.transaction.rpc);
        const additionalRPCs = [];

        for(let rpcId of task.transaction.additionalRPCs){
            additionalRPCs.push(RPCService.get(rpcId));
        }

        const hashes = await TransactionSenderService.send(task, wallet, mainRPC, additionalRPCs, txnData);
    }

    // Builds a transaction given just the task ID (timestamp/custom)
    static async buildTransaction(taskId: string, gasLimit?: number){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const group = GroupsService.get(task.group);
        const rpc = RPCService.get(task.transaction.rpc);
        const wallet = WalletsService.getWallet(task.wallet);


    }



    // Sends a transaction given a task ID, the data to send, and if follow transaction is false (timestamp/custom)
    static async sendTransaction(taskId: string, txnData: ethers.providers.TransactionRequest){

    }
}