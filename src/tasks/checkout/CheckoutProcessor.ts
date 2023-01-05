import {ITask} from "../../definitions/tasks/TaskTypes";
import {EventEmitter} from "events";
import {BlockObject} from "../monitor/BlockMonitor";
import {BigNumber, ethers} from "ethers";
import {WatchMessage} from "../../definitions/tasks/TaskProcessor";
import groupsManager, {IGroup} from "../../managers/GroupsManager";
import rpcManager from "../../managers/RPCManager";
import walletsManager from "../../managers/WalletsManager";

export class CheckoutProcessor extends EventEmitter{
    private task: ITask;
    private group: IGroup;
    private signer: ethers.Wallet;
    private sentHashes: string[];

    constructor(task: ITask, group: IGroup){
        super();

        this.sentHashes = [];
        this.group = group;
        this.task = task;
        const firstProvider = this.task.transactionSettings.nodes[0];
        this.signer = new ethers.Wallet(
            walletsManager.fetchWallet(task.account).privateKey,
            rpcManager.getRPCInstance(firstProvider)
        );
    }

    sendFollowTransaction(txn: WatchMessage){

    }

    async createTransactionObject(){
        console.log("sending txn");
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
                maxFeePerGas: maxFee,
            }

            const transaction = await this.signer.populateTransaction(transactionObject);

            this.sendTransaction(transaction);
        }
    }

    private async sendTransaction(transaction: ethers.providers.TransactionRequest){
        const signedTxn = await this.signer.signTransaction(transaction);

        // TODO check user provided gas limit
        let gasLimit: number | BigNumber | undefined;

        for(let rpc of this.task.transactionSettings.nodes){
            const rpcInstance = rpcManager.getRPCInstance(rpc);

            if(gasLimit == null) {
                try {
                    gasLimit = await rpcInstance.estimateGas(transaction)

                    transaction.gasLimit = gasLimit;

                    console.log('estimated limit', gasLimit.toString())
                } catch (err) {
                    console.log(err);
                    throw new Error("Could not estimate gas");
                }
            }

            const response = await rpcInstance.sendTransaction(signedTxn);

            if(!this.sentHashes.includes(response.hash)){
                console.log("sent txn hash", response.hash);
                this.sentHashes.push(response.hash);
            }

            this.emit("sent", response.hash);
        }
    }

    handleNewBlock(block: BlockObject){
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