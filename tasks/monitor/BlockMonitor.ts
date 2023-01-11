import {WebSocket} from "ws";
import {EventEmitter} from "events";

export interface BlockObject {
    transactions: string[],
    number: number,
    timestamp: number,
    baseFee: number
}

export interface BlockMessage {
    id: string
    block: BlockObject,
    time: string
}

export class BlockMonitor extends EventEmitter{
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        super();
        this.ws = ws;

        this.ws.on("message", (message: string) => {
            this.handleMessage(message);
        });
    }

    private handleMessage(message: string){
        const data = this.isJSON(message);
        // Check if data from message is valid
        if(data == null) return;
        if(data.id == null) return;

        if(typeof data.block === "object"){
            // Call all registered callbacks
            const msg = data as BlockObject;

            this.emit("block", msg);
        }
    }

    private isJSON(string: string): {[key: string]: any} | null{
        try{
            return JSON.parse(string);
        }catch(err){
            return null;
        }
    }

}