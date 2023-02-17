import {ethers} from "ethers";
import {RPCEmitter} from "../emitters/RPCEmitter";

export interface IRPC extends IRPCIncomplete{
    emitter: RPCEmitter
}

export interface IRPCIncomplete extends IRPCOptions {
    id: string,
    default: boolean,
    type: "http" | "ws",
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
    subscription: RPCEmitter
}

export interface IRPCInstanceStorage {
    [key: string]: IRPCInstance
}