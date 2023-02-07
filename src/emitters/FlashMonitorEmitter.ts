import WebSocket from "ws"
import {EventEmitter} from "events";
import {ITask} from "../types/TaskTypes";
import {IMonitorClientMessage, IMonitorTask, MonitorEmitterStorage} from "../types/TaskMonitorTypes";

export class FlashMonitorEmitter {

    private ws: WebSocket;
    private emitters: MonitorEmitterStorage;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.emitters = {};

        this.ws.on("message", this.handleMessage);
    }

    public add(task: IMonitorTask): EventEmitter{
        const emitter = new EventEmitter();
        this.emitters[task.id] = emitter;
        return emitter;
    }

    public remove(task: IMonitorTask): boolean{
        delete this.emitters[task.id];
        return true;
    }

    private handleMessage(message: string) {
        const data = this.isJSON(message);
        // Check if data from message is valid
        if (data == null) return;
        if (data.id == null) return;

        if (typeof data.block === "number") {
            // Call all registered callbacks
            const msg = data as IMonitorClientMessage;

            if(this.emitters[msg.id]){
                this.emitters[msg.id].emit("message", msg);
                // Handle auto emitter deletion if its the emission for the confirmed txn
            }
        }
    }

    private isJSON(string: string): { [key: string]: any } | null {
        try {
            return JSON.parse(string);
        } catch (err) {
            return null;
        }
    }
}