import {IMonitorClientMessage} from "../types/TaskMonitorTypes";
import {ITask} from "../types/TaskTypes";
import {ethers} from "ethers";
import {GroupsService} from "./GroupsService";
import {IGroup} from "../types/GroupTypes";
import {IRPC} from "../types/RPCTypes";
import {IStoredWallet} from "../types/WalletTypes";

export class TransactionBuilderService {

    static async build(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet): Promise<ethers.providers.TransactionRequest>;
    static async build(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet, txnData: IMonitorClientMessage): Promise<ethers.providers.TransactionRequest>;

    static async build(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet, txnData?: IMonitorClientMessage): Promise<ethers.providers.TransactionRequest>{
        if(txnData){
            return this.buildFollowTransaction(task, group, rpc, wallet, txnData);
        }else{
            return this.buildTimestampTransaction(task, group, rpc, wallet);
        }
    }

    // Build, send, and keep track
    private static async buildTimestampTransaction(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet): Promise<ethers.providers.TransactionRequest>{
        // Main transaction info
        let transactionObject: ethers.providers.TransactionRequest = {
            to: group.target,
            data: task.transaction.data,
            value: ethers.utils.parseEther(task.transaction.value+""),
        }

        // TODO Use gas client here if needed, assuming data is provided in txn now
        if(task.transaction.gas.type === "provided"){
            transactionObject = {
                ...transactionObject,
                maxPriorityFeePerGas: ethers.utils.parseUnits(task.transaction.gas.maxPriorityFeePerGas+ "", "gwei"),
                maxFeePerGas: ethers.utils.parseUnits(task.transaction.gas.maxFeePerGas + "", "gwei")
            }
        }else if(task.transaction.gas.type === "auto"){
            // TODO Use GasClient to estimate gas here

            transactionObject = {
                ...transactionObject,
                maxPriorityFeePerGas: ethers.utils.parseUnits(5 + "", "gwei"),
                maxFeePerGas: ethers.utils.parseUnits(5 + "", "gwei")
            }
        }

        // Set gas limit
        if(task.transaction.gas.gasLimit){
            transactionObject.gasLimit = task.transaction.gas.gasLimit;
        }

        const createdWallet = new ethers.Wallet(wallet.privateKey, rpc.emitter.getProvider());

        // Set nonce if user set
        if(task.transaction.nonce){
            transactionObject.nonce = task.transaction.nonce;
        }else{
            // We do this so transactions overwrite rather than queue
            transactionObject.nonce = await createdWallet.getTransactionCount();
        }

        return await createdWallet.populateTransaction(transactionObject);
    }

    private static async buildFollowTransaction(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet, txnData: IMonitorClientMessage): Promise<ethers.providers.TransactionRequest>{
        // Make sure task is valid
        if(task.transaction.gas.gasLimit == null) throw new Error("");

        // Main transaction info
        let transactionObject: ethers.providers.TransactionRequest = {
            to: group.target,
            data: task.transaction.data,
            value: ethers.utils.parseEther(task.transaction.value+""),
        }

        // Set txn gas to match the txn we are following
        transactionObject = {
            ...transactionObject,
            gasLimit: task.transaction.gas.gasLimit,
            maxPriorityFeePerGas: ethers.utils.parseUnits(txnData.gas.maxPriorityFeePerGas + "", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits(txnData.gas.maxFeePerGas + "", "gwei")
        }

        const createdWallet = new ethers.Wallet(wallet.privateKey, rpc.emitter.getProvider());

        // Set nonce if user set
        if(task.transaction.nonce){
            transactionObject.nonce = task.transaction.nonce;
        }else{
            // We do this so transactions overwrite rather than queue
            transactionObject.nonce = await createdWallet.getTransactionCount();
        }

        // Make sure txn is valid
        if(txnData.stage === "pending" && transactionObject.gasLimit == null){
            throw new Error("gas limit must be provided for follow txns");
        }

        return await createdWallet.populateTransaction(transactionObject);
    }

}