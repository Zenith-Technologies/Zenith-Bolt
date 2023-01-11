import {EventEmitter} from "events";
import {WebSocket} from "ws";
import axios from "axios";
import {MONITOR_URL} from "../../src/utils/Constants";
import {WatchTaskInfo} from "./Monitor";
import {WatchTaskMessage} from "../../src/definitions/tasks/TaskProcessor";

export class WatchMonitor extends EventEmitter {
    private ws: WebSocket;
    private token: string;
    constructor(ws: WebSocket, token: string){
        super();

        this.ws = ws;
        this.token = token;

        this.ws.on("message", (message: string) => {
            this.handleMessage(message);
        });
    }

    private handleMessage(message: string){
        const data = this.isJSON(message);
        // Check if data from message is valid
        if(data == null) return;
        if(data.id == null) return;

        if(typeof data.block === "number"){
            // Call all registered callbacks
            const msg = data as WatchTaskMessage;

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

    public async startWalletMonitoring(taskInfo: WatchTaskInfo): Promise<string | false> {
        try {
            const resp = await axios({
                url: `${MONITOR_URL}task/watch`,
                method: "POST",
                data: taskInfo,
                headers: {
                    "x-auth": this.token
                }
            });

            if (resp?.data?.id) {
                return resp.data.id;
            } else {
                throw new Error("No success value found in reply - possible invalid license");
            }
        }catch(err){
            this.emit("error", err);
            return false;
        }
    }

    public async removeWalletMonitor(taskId: string): Promise<boolean> {
        try {
            const resp = await axios({
                url: `${MONITOR_URL}task/watch/${taskId}`,
                method: "DELETE",
                headers: {
                    "x-auth": this.token
                }
            });

            if (resp?.data?.id) {
                return true;
            } else {
                throw new Error("No success value found in reply - possible invalid license");
            }
        }catch(err){
            this.emit("error", err);
            return false;
        }
    }
}