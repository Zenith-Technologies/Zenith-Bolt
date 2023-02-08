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
            const {emitter} = await MonitorService.monitor(task);

            emitter.on("message", (data: IMonitorClientMessage) => {
                if (data.stage === "pending") {
                    // TODO Convert this to a request
                    this.buildFollowTransaction(taskId, data);

                    // Psuedocode from here on
                    /*
                    POST /tasks/<id>/follow/pending (pending controller below)
                    const txnData = FollowTransactionBuilder.build(task, data);
                    const txnHashes = TransactionSender.send(task, txnData);
                    const blockEmitters = RPCService.getEmitters([RPC IDS HERE]);
                    for(let emitter of blockEmitters){
                        emitter.once("block", (data) => {
                            if(block.transactions.some(txnHash => txnHashes.includes(txnHash))){
                                task.status = "success"
                            }
                        }
                    }
                    if(task.status != "success"){

                    }
                     */
                } else if (data.stage === "confirmed") {
                    this.confirmed(taskId);
                }
            });
        }else if(task.mode.type === "timestamp"){

        }else if(task.mode.type === "custom"){

        }else{
            // THROW ERROR - SHOULD NEVER HAPPEN
        }
    }

    // Builds a transaction given a message from the monitor and a task ID (follow)
    static async buildFollowTransaction(taskId: string, txnData: IMonitorClientMessage){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const group = GroupsService.get(task.group);
        const rpc = RPCService.get(task.transaction.rpc);
        const wallet = WalletsService.getWallet(task.wallet);

        // Set metadata
        if(TasksService.getMetadata(taskId)){
            let metadata = TasksService.getMetadata(taskId);
            if(metadata?.type !== "follow"){
                const metadata: TaskMetadata = {
                    type: "follow",
                    followingTransaction: txnData.hash,
                    transactionHashesSent: []
                }

                TasksService.upsertMetadata(taskId, metadata);
            }else {
                metadata.followingTransaction = txnData.hash;
            }
        }else{
            const metadata: TaskMetadata = {
                type: "follow",
                followingTransaction: txnData.hash,
                transactionHashesSent: []
            }

            TasksService.upsertMetadata(taskId, metadata);
        }


        let toSend = await TransactionBuilderService.buildFollowTransaction(task, group, rpc, wallet, txnData);

        // TODO turn this into a request (TransactionRequest is JSON.stringify-able)
        this.sendFollowTransaction(taskId, toSend);
    }

    // Builds a transaction given just the task ID (timestamp/custom)
    static async buildTransaction(){

    }

    // Sends a transaction given a task ID, the data to send, and if follow transaction is true (follow)
    static async sendFollowTransaction(taskId: string, txnData: ethers.providers.TransactionRequest){
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
        return hashes;
    }

    // Sends a transaction given a task ID, the data to send, and if follow transaction is false (timestamp/custom)
    static async sendTransaction(taskId: string, txnData: ethers.providers.TransactionRequest){

    }

    static async waitForFollowTransaction(taskId: string, block: number){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");
        const metadata = TasksService.getMetadata(taskId);
        if(metadata == null) throw new Error("Call stack weird");
        if(metadata.type !== "follow") throw new Error("Call stack weirder");

        const wallet = WalletsService.getWallet(task.wallet);
        const mainRPC = RPCService.get(task.transaction.rpc);

        // I don't know if this should be in the controller since this is *technically* business logic, but I'll let danny decide if it is and where it goes
        const provider = mainRPC.emitter.getProvider();
        const blockNumber = await provider.getBlockNumber();

        if(blockNumber < block){
            provider.on("fullblock", (block: ethers.providers.Block) => {
                // These variables will track how the task is going after the loops process
                let taskStatus: "waiting" | "mined" | "minedEarly" | "notMined" = "waiting";
                let transactionHash: string;

                if(block.transactions.includes(metadata.followingTransaction)){
                    // Transaction we were following has been mined, let's see if our transactions made it
                    for(let txn of metadata.transactionHashesSent){
                        if(block.transactions.includes(txn)){
                            // A transaction confirmed before ours made it - task success
                            taskStatus = "mined";
                            transactionHash = txn;
                        }
                    }

                    // If after the loop status hasn't changed, we didn't get mined
                    if(taskStatus === "waiting"){
                        taskStatus = "notMined";
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

                if(taskStatus === "success"){
                    // Now we need to verify the transaction actually succeeded
                }else if(taskStatus === "minedEarly"){
                    // Our transaction mined BEFORE the following transaction - retry transaction after its confirmed
                }else if(taskStatus === "notMined"){
                    // Our transaction didn't get mined - simply resend it
                }else{
                    // We just continue waiting
                }
            })
        }else{
            const block = await provider.getBlock(blockNumber);


        }
    }

    static async confirmed(taskId: string){
        const task = TasksService.get(taskId);
        if(task == null) throw new Error("Invalid task id");


    }

    static followRebuild(taskId: string) {
        // We rebuild the transaction here without the
    }

    static send(){

    }
}