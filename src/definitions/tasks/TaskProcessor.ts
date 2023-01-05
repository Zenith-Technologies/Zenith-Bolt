import {IStatus} from "./TaskTypes";
import {EventEmitter} from "events";

export interface TaskProcessor extends EventEmitter{
    startTask(): Promise<boolean>;

    stopTask(): Promise<boolean>;

    getStatus(): IStatus;
}

export interface WatchMessage {
    id: string,
    stage: "pending" | "confirmed",
    block: number,
    gas: {
        maxPriorityFeePerGas: number,
        maxFeePerGas: number
    }
}