import {EventEmitter} from "events";
import {WebSocket} from "ws";
import {FollowAPIMessage} from "../types/FollowAPITypes";

export class FollowAPISubscription extends EventEmitter{
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        super();
        this.ws = ws;

        this.ws.on("message", this.handleMessage);
    }

    private handleMessage(message: string){
        const data = this.isJSON(message);
        // Check if data from message is valid
        if(data == null) return;
        if(data.id == null) return;

        if(typeof data.block === "number"){
            // Call all registered callbacks
            const msg = data as FollowAPIMessage;

            this.emit(msg.id, data);
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