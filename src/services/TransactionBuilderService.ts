import {IMonitorClientMessage} from "../types/TaskMonitorTypes";
import {ITask} from "../types/TaskTypes";
import {ethers} from "ethers";
import {GroupsService} from "./GroupsService";
import {IGroup} from "../types/GroupTypes";
import {IRPC} from "../types/RPCTypes";
import {IStoredWallet} from "../types/WalletTypes";

export class TransactionBuilderService {
    // Build, send, and keep track

    static async build(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet): Promise<ethers.providers.TransactionRequest>{
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

        // Set nonce if user set
        if(task.transaction.nonce){
            transactionObject.nonce = task.transaction.nonce;
        }

        const createdWallet = new ethers.Wallet(wallet.privateKey, rpc.emitter.getProvider());

        return await createdWallet.populateTransaction(transactionObject);
    }

    static async build(task: ITask, group: IGroup, rpc: IRPC, wallet: IStoredWallet, txnData: IMonitorClientMessage): Promise<ethers.providers.TransactionRequest>{
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

        // Set nonce if user set
        if(task.transaction.nonce){
            transactionObject.nonce = task.transaction.nonce;
        }

        if(txnData.stage === "pending" && transactionObject.gasLimit == null){
            throw new Error("gas limit must be provided for follow txns");
        }

        const createdWallet = new ethers.Wallet(wallet.privateKey, rpc.emitter.getProvider());

        return await createdWallet.populateTransaction(transactionObject);
    }

}