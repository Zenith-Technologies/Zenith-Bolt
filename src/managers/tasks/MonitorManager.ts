import {WebSocket} from "ws";
import {IWatchTaskOptions} from "../../definitions/tasks/TaskTypes";
import axios from "axios";
import {MONITOR_URL} from "../../utils/Constants";
import EventEmitter from "events";

type MonitorCallback = MonitorWatchCallback | MonitorBlockCallback;

interface IMonitorCallbacks {
    [key: string]: MonitorCallback
}

interface MonitorBlockCallback {
    (id: string, block: number, time: number): void;
}

interface MonitorWatchCallback {
    (id: string, stage: "confirmed" | "pending", block: number, time: number): void;
}

interface SocketMessage {
    id: string,
    stage?: "confirmed" | "pending",
    block: number,
    time: number
}

class MonitorManager extends EventEmitter{
    private ws: WebSocket;
    private callbacks: IMonitorCallbacks;
    private authToken: string;

    constructor() {
        super();

        this.ws = new WebSocket("");

        this.callbacks = {};
        this.authToken = "";

        axios({
            url: `${MONITOR_URL}authentication/verify`,
            method: "POST",
            data: {
                license: "abc",
                identifier: "123",
            }
        }).then((resp) => {
            if(resp?.data?.success){
                this.authToken = resp.data;

                this.ws = new WebSocket("ws://localhost:2947",{
                    headers: {
                        "x-auth": this.authToken
                    }
                });
                this.ws.on("message", this.handleMessage);

                this.emit("ready");
            }else{
                this.emit("error");
            }
        }).catch(err => {
            this.emit("error");
        })
    }

    async addMonitorTask(cb: MonitorCallback, type: "watch" | "block", options?: IWatchTaskOptions): Promise<boolean | string>{
        if(type === "block"){
            try {
                const response = await axios({
                    url: `${MONITOR_URL}task/block`,
                    method: "POST",
                    data: {}
                })

                const taskId = response.data.id;

                this.callbacks[taskId] = cb;

                return taskId;
            }catch(err){
                console.log(err);

                return false;
            }
        }else if(type === "watch"){
            // We need options for this task type
            if(options == null) return false;
            try {
                const response = await axios({
                    url: `${MONITOR_URL}task/watch`,
                    method: "POST",
                    data: options
                });

                const taskId = response.data.id;

                this.callbacks[taskId] = cb;

                return taskId;
            }catch(err){
                console.log(err);
                return false;
            }
        }
        return false;
    }

    handleMessage(message: string){
        const data = this.isJSON(message);
        if(data == null) return;
        if(data.id == null || data.stage == null || data.time == null) return;
        const msg = data as SocketMessage;
        if(this.callbacks[msg.id]){
            if(msg.stage){
                const cb = this.callbacks[msg.id] as MonitorWatchCallback;
                cb(msg.id, msg.stage, msg.block, msg.time);
            }else{
                const cb = this.callbacks[msg.id] as MonitorBlockCallback;
                cb(msg.id, msg.block, msg.time);
            }
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

const monitorManager = new MonitorManager();

export default monitorManager;