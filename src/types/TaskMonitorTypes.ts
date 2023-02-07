import {EventEmitter} from "events";

export interface IMonitorClientMessage {
    id: string,
    stage: "pending" | "confirmed",
    block: number,
    gas: {
        maxPriorityFeePerGas: number,
        maxFeePerGas: number
    },
    hash: string
}

export interface IMonitorTaskOptions {
    contract: string,
    owner: string,
    data: string
}

export interface IMonitorTask extends IMonitorTaskOptions {
    id: string
}

export interface MonitorEmitterStorage {
    [key: string]: EventEmitter
}