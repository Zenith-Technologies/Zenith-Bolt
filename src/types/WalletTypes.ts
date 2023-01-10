export interface IWalletOptions {
    privateKey: string
}

export interface IWallet {
    id: string,
    address: string
}

export interface IStoredWallet extends IWallet {
    privateKey: string
}

export interface IWalletGroupOptions {
    name: string,
    wallets?: IWalletOptions[]
}

export interface IWalletGroup {
    id: string,
    name: string,
    wallets: IWallet[]
}

export interface IWalletGroupStorage {
    [key: string]: IWalletGroup
}