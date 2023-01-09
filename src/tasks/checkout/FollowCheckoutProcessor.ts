import {
    IMintFollowOptions,
    IMintTaskOptions,
    IMintTimestampOptions,
    ITask,
    ITransactionSettingsOptions
} from "../../definitions/tasks/TaskTypes";
import {EventEmitter} from "events";
import {BlockObject} from "../monitor/BlockMonitor";
import {BigNumber, BigNumberish, ethers, Wallet} from "ethers";
import groupsManager, {IGroup} from "../../controllers/GroupsController";
import rpcManager from "../../controllers/RPCController";
import walletsManager, {IFullWallet} from "../../controllers/WalletsController";
import {WatchTaskMessage} from "../../definitions/tasks/TaskProcessor";

export class FollowCheckoutProcessor extends EventEmitter{
    private task: ITask;
    private group: IGroup;
    private wallet: IFullWallet;
    private sentTxns: ethers.providers.TransactionResponse[];
    private currentBlock: number;
    private currentStage: "pending" | "confirmed" | "completed" | null;
    private nonce: BigNumberish | null;

    constructor(task: ITask, group: IGroup){
        super();

        this.sentTxns = [];
        this.currentStage = null;
        this.group = group;
        this.task = task;
        this.wallet = walletsManager.fetchWallet(task.account);
        this.nonce = null;
        this.currentBlock = -1;
    }


    async createMintTransaction(data: WatchTaskMessage){
        if(this.currentBlock < data.block){
            // Wait for cloud block monitor to catch up
            console.log("cloud monitor backed up, waiting for catchup");
            await this.checkCurrentBlock(data.block);
        }
        console.log("running create mint", this.currentStage);

        if(this.currentStage === "completed"){
            return;
        }

        this.currentStage = "confirmed";

        const gas = this.calculateGas(this.task.transactionSettings);

        const transactionObject: ethers.providers.TransactionRequest = {
            to: this.group.target,
            data: this.task.taskSettings.data,
            value: ethers.utils.parseEther((this.task.taskSettings as IMintTaskOptions).price+""),
            maxPriorityFeePerGas: ethers.utils.parseUnits(gas.maxPriorityFeePerGas+"", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits(gas.maxFeePerGas+"", "gwei")
        }

        if(this.nonce){
            transactionObject.nonce = this.nonce;
        }

        if(this.task.transactionSettings.gasLimit){
            transactionObject.gasLimit = this.task.transactionSettings.gasLimit;
        }

        console.log(transactionObject);

        console.log("checking rpc blocks");
        let provider = await this.checkRPCBlocks();
        if(provider == null){
            provider = await this.waitForCurrentRPCBlock();
        }
        console.log("received rpc provider - lets go!!!");

        const wallet = new ethers.Wallet(this.wallet.privateKey, provider);
        const txn = await wallet.populateTransaction(transactionObject);

        this.sendTransaction(txn, wallet);
    }

    // TODO make this NOT use setInterval
    private checkCurrentBlock(targetBlock: number): Promise<void>{
        return new Promise((resolve) => {
            console.log(targetBlock, "target block");
            const id = setInterval(() => {
                if(this.currentBlock >= targetBlock) {
                    clearInterval(id);
                    resolve();
                }
            }, 100);
        })
    }

    async createMatchTransaction(data: WatchTaskMessage){
        this.currentStage = "pending";
        console.log("create match ran");
        const taskSettings = this.task.taskSettings as IMintTaskOptions;
        const monitorSettings = taskSettings.monitorSettings as IMintFollowOptions;

        const gas = data.gas;

        const gasLimit = monitorSettings.gasLimit;

        const transactionObject: ethers.providers.TransactionRequest = {
            to: this.group.target,
            data: this.task.taskSettings.data,
            value: ethers.utils.parseEther((this.task.taskSettings as IMintTaskOptions).price+""),
            maxPriorityFeePerGas: ethers.utils.parseUnits(/*gas.maxPriorityFeePerGas*/0.001+"", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits(/*gas.maxFeePerGas*/0.001+"", "gwei"),
            gasLimit: gasLimit
        }

        if(this.nonce){
            transactionObject.nonce = this.nonce;
        }

        const rpc = rpcManager.getRPCInstance(this.task.transactionSettings.nodes[0]);

        const wallet = new ethers.Wallet(this.wallet.privateKey, rpc);

        const txn = await wallet.populateTransaction(transactionObject);

        console.log(txn, "txn populated");

        this.sendTransaction(txn, wallet);
    }

    private calculateGas(transactionSettings: ITransactionSettingsOptions): ethers.providers.TransactionRequest{
        const gasSettings = transactionSettings.gas;

        const gas = {
            maxPriorityFeePerGas: 0,
            maxFeePerGas: 0
        }

        if(gasSettings.mode === "auto"){
            // TODO We get the prediction for gas here
            gas.maxFeePerGas = 25;
            gas.maxPriorityFeePerGas = 2;

            if(gasSettings.gasFactor){
                gas.maxFeePerGas *= gasSettings.gasFactor;
                gas.maxPriorityFeePerGas *= gasSettings.gasFactor;
            }

            if(gas.maxFeePerGas > gasSettings.maxCostPerGas){
                gas.maxFeePerGas = gasSettings.maxCostPerGas;
            }
        }else if(gasSettings.mode === "provided"){
            gas.maxFeePerGas = gasSettings.maxFeePerGas;
            gas.maxPriorityFeePerGas = gasSettings.priorityFee;
        }

        const prioFee = ethers.utils.parseUnits(gas.maxPriorityFeePerGas+"", "gwei");
        const maxFee = ethers.utils.parseUnits(gas.maxFeePerGas+"", "gwei");

        const transactionObject: ethers.providers.TransactionRequest = {
            to: this.group.target,
            data: this.task.taskSettings.data,
            value: ethers.utils.parseEther((this.task.taskSettings as IMintTaskOptions).price+""),
            maxPriorityFeePerGas: prioFee,
            maxFeePerGas: maxFee
        }

        return transactionObject;

    }

    private async checkRPCBlocks(): Promise<ethers.providers.BaseProvider | null>{
        for(let rpc of this.task.transactionSettings.nodes) {
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            const currentBlock = rpcManager.getRPCBlock(rpc);
            console.log("crb checking", currentBlock + " vs ", this.currentBlock);
            if(currentBlock >= this.currentBlock){
                return rpcInstance;
            }
        }
        return null;
    }

    private async waitForCurrentRPCBlock(): Promise<ethers.providers.BaseProvider> {
        // Get all the wait promises and events
        const allWaits: Promise<ethers.providers.BaseProvider>[] = [];
        const cancelEvents: (() => void)[] = [];

        for(let rpc of this.task.transactionSettings.nodes) {
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            // Set up functions to cancel when one is found and to alert on event
            allWaits.push(new Promise((resolve) => {
                const alertFunc = (number: number) => {
                    console.log("alertFunc", number, "vs", this.currentBlock);
                    if(number >= this.currentBlock) {
                        resolve(rpcInstance);
                        return;
                    }
                };

                rpcInstance.once("block", alertFunc);

                cancelEvents.push(() => {
                    rpcInstance.removeListener("block", alertFunc);
                })
            }));
        }

        // Wait for first response
        const fastestRPC = await Promise.race(allWaits);

        // Cancel the rest of the events
        for(let cancel of cancelEvents){
            cancel();
        }

        return fastestRPC;
    }

    private async sendTransaction(transaction: ethers.providers.TransactionRequest, wallet: ethers.Wallet){
        this.nonce = transaction.nonce as BigNumberish;
        const signedTxn = await wallet.signTransaction(transaction);

        for(let rpc of this.task.transactionSettings.nodes){
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            const response = await rpcInstance.sendTransaction(signedTxn);

            if(!this.sentTxns.some(txn => txn.hash === response.hash)){
                console.log("sent txn hash", response.hash);
                this.sentTxns.push(response);
            }

            this.emit("sent", response.hash);
        }
    }

    handleNewBlock(block: BlockObject){
        // We check if our transaction sent has been confirmed
        if(this.currentStage === "pending" && this.sentTxns.length !== 0){
            if(this.sentTxns.some(txn => block.transactions.includes(txn.hash))){
                // One of the sent txn hashes were found in the block, set stage to completed
                this.currentStage = "completed";
            }
        }

        this.currentBlock = block.number;
        console.log(this.currentBlock, "new block");
    }
}