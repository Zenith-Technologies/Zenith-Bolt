import { nanoid } from 'nanoid'
import {ethers} from "ethers";

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

class WalletsManager {
    private wallets: {
        [key: string]: IWalletGroup
    }

    constructor() {
        this.wallets = {};
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

        return true;
    }

    restoreWalletGroup(groupId: string): boolean{
        return true;
    }

    editWalletGroup(group: IWalletGroupEditOptions): boolean {
        // First we need to delete all PKs stored from old group
        const oldGroup: IWalletGroup = this.wallets[group.id];
        for(let wallet of oldGroup.wallets){
            // del(wallet.id)
        }

        // Create a new group and override the old one
        const newGroup: IWalletGroup = {
            name: group.name,
            id: group.id,
            wallets: []
        }

        newGroup.wallets = this.convertWallets(group.wallets);

        this.wallets[group.id] = newGroup;

        return true;
    }

    fetchWallet(id: string): IFullWallet {
        return {
            id: "",
            address: "",
            privateKey: ""
        };
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

            newWallets.push(newWallet);
        }

        return newWallets;
    }

}

const walletsManager = new WalletsManager();

export default walletsManager;