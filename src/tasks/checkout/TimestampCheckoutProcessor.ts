import {IMintTimestampOptions, ITask} from "../../definitions/tasks/TaskTypes";
import {EventEmitter} from "events";
import {BlockObject} from "../monitor/BlockMonitor";
import {BigNumber, ethers, Wallet} from "ethers";
import groupsManager, {IGroup} from "../../controllers/GroupsController";
import rpcManager from "../../controllers/RPCController";
import walletsManager from "../../controllers/WalletsController";

export class TimestampCheckoutProcessor extends EventEmitter{
    private task: ITask;
    private group: IGroup;
    private signer: ethers.Wallet;
    private sentHashes: string[];
    private currentBlock: number;
    private retryTransaction: boolean;

    constructor(task: ITask, group: IGroup, latestBlock: number){
        super();

        this.retryTransaction = false;
        this.currentBlock = latestBlock;
        this.sentHashes = [];
        this.group = group;
        this.task = task;
        this.signer = new ethers.Wallet(
            walletsManager.fetchWallet(task.account).privateKey
        );
    }

    async createTransactionObject(){
        if(this.task.taskSettings.type === "mint"){
            const transactionSettings = this.task.transactionSettings;
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
                value: ethers.utils.parseEther(this.task.taskSettings.price+""),
                maxPriorityFeePerGas: prioFee,
                maxFeePerGas: maxFee
            }

            if(this.task.transactionSettings.gasLimit){
                transactionObject.gasLimit = this.task.transactionSettings.gasLimit;
            }

            const settings = this.task.taskSettings.monitorSettings as IMintTimestampOptions;

            if(settings.attemptFirstBlock && settings.firstBlockGasLimit){
                transactionObject.gasLimit = settings.firstBlockGasLimit;
            }

            let rpcProvider = await this.checkRPCBlocks();

            if(rpcProvider == null){
                rpcProvider = await this.waitForCurrentRPCBlock();
            }

            const signer = new Wallet(this.signer.privateKey, rpcProvider);

            try {
                const transaction = await signer.populateTransaction(transactionObject);

                this.sendTransaction(transaction);
            }catch(err){
                console.log("Prediction failed and no backup gasLimit has been set. Retrying next block");

                this.retryTransaction = true;
                return;
            }
        }
    }

    private async checkRPCBlocks(): Promise<ethers.providers.BaseProvider | null>{
        for(let rpc of this.task.transactionSettings.nodes) {
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            const currentBlock = rpcManager.getRPCBlock(rpc);
            console.log("rpc block", currentBlock);
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

    private async sendTransaction(transaction: ethers.providers.TransactionRequest){
        const signedTxn = await this.signer.signTransaction(transaction);

        // Check if user provided a gas limit
        if(this.task.transactionSettings.gasLimit){
            transaction.gasLimit = this.task.transactionSettings.gasLimit;
        }

        for(let rpc of this.task.transactionSettings.nodes){
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            const response = await rpcInstance.sendTransaction(signedTxn);

            if(!this.sentHashes.includes(response.hash)){
                console.log("sent txn hash", response.hash);
                this.sentHashes.push(response.hash);
            }

            this.emit("sent", response.hash);
        }
    }

    handleNewBlock(block: BlockObject){
        this.currentBlock = block.number;
        if(this.retryTransaction){
            this.retryTransaction = false;
            this.createTransactionObject();
        }
        // If a block contains a hash we've sent
        const txnHash = block.transactions.find((elem) => {
            return this.sentHashes.includes(elem);
        });
        if(txnHash != null){
            console.log("mined detected", txnHash);
            this.emit("mined", txnHash);
        }
    }
}