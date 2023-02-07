import {ITask} from "../types/TaskTypes";
import {IRPC} from "../types/RPCTypes";
import {ethers} from "ethers";
import {IStoredWallet} from "../types/WalletTypes";

export class TransactionSenderService {

    static async send(task: ITask, wallet: IStoredWallet, rpc: IRPC, additionalRPCs: IRPC[], txnData: ethers.providers.TransactionRequest){
        
    }

    static resend(){

    }

}