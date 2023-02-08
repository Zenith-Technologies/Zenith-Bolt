import {ITask} from "../types/TaskTypes";
import {IRPC} from "../types/RPCTypes";
import {ethers} from "ethers";
import {IStoredWallet} from "../types/WalletTypes";

export class TransactionSenderService {

    static async send(task: ITask, storedWallet: IStoredWallet, rpc: IRPC, additionalRPCs: IRPC[], txnData: ethers.providers.TransactionRequest){
        const wallet = new ethers.Wallet(storedWallet, rpc.emitter.getProvider());
        const signedTxn: string = await wallet.signTransaction(txnData);

        const transactionHashes: string[] = [];

        // Send transactions and get their hashes
        transactionHashes.push((await rpc.emitter.getProvider().sendTransaction(signedTxn)).hash);
        for(let additionalRPC of additionalRPCs){
            transactionHashes.push((await additionalRPC.emitter.getProvider().sendTransaction(signedTxn)).hash);
        }

        // Create an Emitter object using the transaction hashes array

    }

    static resend(){

    }

}