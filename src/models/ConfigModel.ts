import Conf from "conf";
import {IGroup, IGroupStorage} from "../types/GroupTypes";
import {IRPC, IRPCStorage} from "../types/RPCTypes";
import {IStoredWallet, IWalletGroup, IWalletGroupStorage} from "../types/WalletTypes";
import {ITask, ITaskOptions, ITaskStorage} from "../types/TaskTypes";

export class ConfigModel {
    private static config: Conf;

    constructor() {
        ConfigModel.config = new Conf();
    }

    static getGroups(): IGroupStorage {
        // TODO Verify groups adhere to interface
        return this.config.get("groups", {}) as IGroupStorage;
    }

    static upsertGroup(group: IGroup) {
        this.config.set(`groups.${group.id}`, group);
    }

    static deleteGroup(group: IGroup) {
        this.config.delete(`groups.${group.id}`);
    }

    static getTasks(): ITaskStorage {
        return this.config.get("tasks", {}) as ITaskStorage;
    }

    static upsertTask(task: ITask) {

    }

    static deleteTask(task: ITask) {

    }

    static getRPCs(): IRPCStorage {
        // TODO Verify RPCs adhere to interface
        return this.config.get("rpcs", {}) as IRPCStorage;
    }

    static upsertRPC(rpc: IRPC) {
        this.config.set(`rpcs.${rpc.id}`, rpc);
    }

    static deleteRPC(rpc: IRPC) {
        this.config.delete(`rpcs.${rpc.id}`);
    }

    static getWalletGroups(): IWalletGroupStorage{
        return this.config.get(`walletgroups`, {}) as IWalletGroupStorage;
    }

    static upsertWalletGroup(group: IWalletGroup){
        this.config.set(`walletgroups.${group.id}`, group);
    }

    static deleteWalletGroup(group: IWalletGroup){
        this.config.delete(`walletgroups.${group.id}`);
    }

    static getWallet(id: string): IStoredWallet{
        return this.config.get(`wallets.${id}`, {}) as IStoredWallet;
    }

    static upsertWallet(wallet: IStoredWallet){
        this.config.set(`wallets.${wallet.id}`, wallet);
    }

    static deleteWallet(id: string) {
        this.config.delete(`wallets.${id}`);
    }

}

new ConfigModel();