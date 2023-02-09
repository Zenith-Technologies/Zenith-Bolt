import {ITask} from "../types/TaskTypes";
import {IRPC} from "../types/RPCTypes";
import {IGroup} from "../types/GroupTypes";
import {ethers} from "ethers";

export class TransactionTestingService {
    static async checkValidity(task: ITask, group: IGroup, rpc: IRPC): Promise<boolean> {
        const provider = rpc.emitter.getProvider();

        try{
            let transactionObject: ethers.providers.TransactionRequest = {
                to: group.target,
                data: task.transaction.data,
                value: ethers.utils.parseEther(task.transaction.value+""),
            }

            await provider.estimateGas(transactionObject);

            return true;
        }catch(err){
            return false;
        }
    }
}