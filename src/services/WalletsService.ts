import {
    IStoredWallet,
    IWallet,
    IWalletGroup,
    IWalletGroupOptions,
    IWalletGroupStorage,
    IWalletOptions
} from "../types/WalletTypes";
import {ConfigModel} from "../models/ConfigModel";
import {nanoid} from "nanoid";
import {ethers} from "ethers";

export class WalletsService {

    private static groups: IWalletGroupStorage;
    constructor() {
        WalletsService.groups = ConfigModel.getWalletGroups();
    }

    static upsertGroup(group: IWalletGroupOptions): IWalletGroup{
        if(group.wallets == null){
            throw new Error("Invalid wallet group options provided: no wallets provided")
        }
        if(group.wallets.length === 0){
            throw new Error("Invalid wallet group options provided: no wallets provided")
        }

        const id = nanoid();

        const newGroup: IWalletGroup = {
            name: group.name,
            id: id,
            wallets: []
        };

        newGroup.wallets = this.convertWallets(group.wallets);

        this.groups[newGroup.id] = newGroup;
        ConfigModel.upsertWalletGroup(newGroup);

        return newGroup;
    }

    static updateGroup(id: string, name: string): IWalletGroup{
        if(this.groups[id] == null){
            throw new Error("Invalid wallet group ID provided")
        }

        this.groups[id].name = name;
        return this.groups[id];
    }

    static removeWalletFromGroup(groupId: string, walletId: string): void {
        if(this.groups[groupId] == null){
            throw new Error("Invalid wallet group ID provided")
        }

        const toRemove = this.groups[groupId].wallets.findIndex(wallet => wallet.id === walletId);
        this.groups[groupId].wallets.splice(toRemove, 1);

        ConfigModel.deleteWallet(walletId);
    }

    static addWalletToGroup(id: string, wallet: IWalletOptions): IWallet{
        if(this.groups[id] == null){
            throw new Error("Invalid wallet group ID provided")
        }
        const groupToAddTo = this.groups[id];

        const newWallet = this.convertWallets([wallet]);

        groupToAddTo.wallets.push(newWallet[0]);

        ConfigModel.upsertWalletGroup(groupToAddTo);

        return newWallet[0];
    }

    static deleteGroup(id: string): void{
        if(this.groups[id] == null){
            throw new Error("Invalid wallet group ID provided")
        }
        const group = this.groups[id];

        for(let wallet of group.wallets){
            ConfigModel.deleteWallet(wallet.id);
        }
        ConfigModel.deleteWalletGroup(group);
        delete this.groups[id];
    }

    static getGroup(id: string): IWalletGroup{
        if(this.groups[id] == null){
            throw new Error("Invalid wallet group ID provided")
        }
        return this.groups[id];
    }

    static getGroups(): IWalletGroup[]{
        return Object.values(this.groups);
    }

    static getWallet(id: string): IStoredWallet{
        const toReturn = ConfigModel.getWallet(id);
        if(toReturn == null){
            throw new Error("Invalid wallet ID provided")
        }
        return toReturn;
    }

    private static convertWallets(wallets: IWalletOptions[]): IWallet[]{
        const newWallets: IWallet[] = [];

        for(let wallet of wallets) {
            const address = (new ethers.Wallet(wallet.privateKey)).address;
            const id = nanoid();

            const newWallet: IWallet = {
                id, address
            };

            const storedWallet: IStoredWallet = {
                ...newWallet,
                privateKey: wallet.privateKey
            }

            ConfigModel.upsertWallet(storedWallet);
            newWallets.push(newWallet);
        }

        return newWallets;
    }
}

new WalletsService();