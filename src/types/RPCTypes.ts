import {ethers} from "ethers";
import {RPCSubscription} from "../subscribers/RPCSubscriber";

export interface IRPC extends IRPCOptions{
    id: string,
    default: boolean,
    type: "http" | "ws"
}

export interface IRPCOptions {
    name: string,
    url: string,
    settings: {
        pollingInterval: number
    },
    default?: boolean
}

export interface IRPCStorage {
    [key: string]: IRPC
}

export interface IRPCInstance {
    provider: ethers.providers.BaseProvider,
    subscription: RPCSubscription
}

export interface IRPCInstanceStorage {
    [key: string]: IRPCInstance
}