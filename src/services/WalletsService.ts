import {
    IStoredWallet,
    IWallet,
    IWalletGroup,
    IWalletGroupOptions,
    IWalletGroupStorage,
    IWalletOptions
} from "../types/WalletTypes";
import {ConfigModel} from "../models/ConfigModel";
import {SuccessResponse} from "../types/ResponseTypes";
import {nanoid} from "nanoid";
import {ethers} from "ethers";

export class WalletsService {

    private static groups: IWalletGroupStorage;
    constructor() {
        WalletsService.groups = ConfigModel.getWalletGroups();
    }

    static upsertGroup(group: IWalletGroupOptions): IWalletGroup | SuccessResponse{
        if(group.wallets == null){
            return {
                success: false,
                message: "Cannot create wallet group with no wallets"
            }
        }
        if(group.wallets.length === 0){
            return {
                success: false,
                message: "Cannot create wallet group with no wallets"
            }
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

    static updateGroup(id: string, name: string): SuccessResponse{
        if(this.groups[id] == null){
            return {
                success: false,
                message: "Cannot update nonexistent wallet group"
            }
        }

        this.groups[id].name = name;
        return {
            success: true
        }
    }

    static removeWalletFromGroup(groupId: string, walletId: string): SuccessResponse {
        if(this.groups[groupId] == null){
            return {
                success: false,
                message: "Cannot update nonexistent wallet group"
            }
        }

        const toRemove = this.groups[groupId].wallets.findIndex(wallet => wallet.id === walletId);
        this.groups[groupId].wallets.splice(toRemove, 1);

        ConfigModel.deleteWallet(walletId);

        return {
            success: true
        }
    }

    static addWalletToGroup(id: string, wallet: IWalletOptions): IWallet | SuccessResponse{
        if(this.groups[id] == null){
            return {
                success: false,
                message: "Cannot add to nonexistent group"
            }
        }
        const groupToAddTo = this.groups[id];

        const newWallet = this.convertWallets([wallet]);

        groupToAddTo.wallets.push(newWallet[0]);

        ConfigModel.upsertWalletGroup(groupToAddTo);

        return newWallet[0];
    }

    static deleteGroup(id: string): SuccessResponse{
        if(this.groups[id] == null){
            return {
                success: false,
                message: "Cannot delete nonexistent group"
            }
        }
        const group = this.groups[id];

        for(let wallet of group.wallets){
            ConfigModel.deleteWallet(wallet.id);
        }
        ConfigModel.deleteWalletGroup(group);
        delete this.groups[id];

        return {
            success: true
        }
    }

    static getGroup(id: string): IWalletGroup | SuccessResponse{
        if(this.groups[id] == null){
            return {
                success: false,
                message: "Cannot get nonexistent wallet group"
            }
        }
        return this.groups[id];
    }

    static getGroups(): IWalletGroup[]{
        return Object.values(this.groups);
    }

    static getWallet(id: string): IStoredWallet{
        const toReturn = ConfigModel.getWallet(id);
        if(toReturn == null){
            throw new Error("nonexistent wallet")
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