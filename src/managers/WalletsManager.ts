import { nanoid } from 'nanoid'
import {ethers} from "ethers";
import config from "../utils/StorageHandler";
import {IGroup} from "./GroupsManager";

export interface IWalletGroup {
    name: string,
    id: string,
    wallets: IWallet[]
}

export interface IWallet {
    id: string,
    address: string
}

export interface IFullWallet {
    id: string,
    address: string,
    privateKey: string
}

export interface IWalletGroupCreateOptions {
    name: string,
    wallets: IWalletOptions[]
}

export interface IWalletGroupEditOptions {
    id: string,
    name: string,
    wallets: IWalletOptions[]
}

export interface IWalletOptions {
    privateKey: string
}

interface WalletGroupObject {
    [key: string]: IWalletGroup
}

class WalletsManager {
    private wallets: WalletGroupObject

    constructor() {
        this.wallets = {};
        if(config.has("walletgroups")){
            const rawGroups = config.get("walletgroups") as WalletGroupObject;
            for(let rawGroup in rawGroups){
                const group = rawGroups[rawGroup];

                this.wallets[group.id] = group;
            }
        }
    }

    createWalletGroup(group: IWalletGroupCreateOptions): boolean{
        if(group.wallets.length === 0) return false;

        const groupId = nanoid();

        const newGroup: IWalletGroup = {
            name: group.name,
            id: groupId,
            wallets: []
        }

        newGroup.wallets = this.convertWallets(group.wallets);

        this.wallets[groupId] = newGroup;

        config.set(`walletgroups.${groupId}`, newGroup);

        return true;
    }

    restoreWalletGroup(groupId: string): boolean{
        return true;
    }

    addWalletToGroup(wallet: IWalletOptions, group: IWalletGroup){
        const convertedWallet = this.convertWallets([wallet])[0];

        group.wallets.push(convertedWallet);

        this.wallets[group.id] = group;

        config.set(`walletgroups.${group.id}`, group);
    }

    editWalletGroup(group: IWalletGroupEditOptions): boolean {
        // First we need to delete all PKs stored from old group
        const oldGroup: IWalletGroup = this.wallets[group.id];
        for(let wallet of oldGroup.wallets){
            config.delete(`wallets.${wallet.id}`);
        }

        // Create a new group and override the old one
        const newGroup: IWalletGroup = {
            name: group.name,
            id: group.id,
            wallets: []
        }

        newGroup.wallets = this.convertWallets(group.wallets);

        this.wallets[group.id] = newGroup;

        config.set(`walletgroups.${group.id}`, group);

        return true;
    }

    fetchWallet(id: string): IFullWallet {
        if(!config.has(`wallets.${id}`)){
            return {
                id: "",
                address: "",
                privateKey: ""
            };
        }
        const fullWallet = config.get(`wallets.${id}`) as IFullWallet;
        return {
            id: fullWallet.id,
            address: fullWallet.address,
            privateKey: fullWallet.privateKey
        };
    }

    getGroups(): IWalletGroup[] {
        return Object.values(this.wallets);
    }

    private convertWallets(wallets: IWalletOptions[]): IWallet[] {
        const newWallets = [];

        for(let wallet of wallets){
            const address = (new ethers.Wallet(wallet.privateKey)).address;
            const id = nanoid(32);
            const newWallet: IWallet = {
                id,
                address
            }

            const fullWallet: IFullWallet = {
                ...newWallet,
                privateKey: wallet.privateKey,
            }

            newWallets.push(newWallet);

            config.set(`wallets.${id}`, fullWallet);
        }

        return newWallets;
    }

}

const walletsManager = new WalletsManager();

export default walletsManager;