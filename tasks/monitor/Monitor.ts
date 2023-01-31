import {EventEmitter} from "events";
import axios from "axios";
import {MONITOR_URL} from "../../src/utils/Constants";
import {WebSocket} from "ws";
import {BlockMonitor} from "./BlockMonitor";
import {WatchMonitor} from "./WatchMonitor";

export interface WatchTaskInfo {
    contract: string,
    owner: string,
    data: string
}

export class Monitor extends EventEmitter{
    private token: string;
    static block: BlockMonitor;
    static watch: WatchMonitor;

    constructor() {
        super();
        this.token = "";

        // Disable listener warning because every task will subscribe to this
        this.setMaxListeners(0);

        this.startAuthentication();
    }

    private async startAuthentication(){

    }

    private async initializeWebsocket(){


        Monitor.block = new BlockMonitor(ws);
        Monitor.watch = new WatchMonitor(ws, this.token);

        this.startBlockMonitoring();
    }

    private async startBlockMonitoring(): Promise<boolean>{
        try {
            const response = await axios({
                url: `${MONITOR_URL}task/block`,
                method: "POST",
                data: {},
                headers: {
                    "x-auth": this.token
                }
            })

            if(response.data?.id){
                this.emit("ready");
                return true;
            }

            throw new Error("Error creating block task - missing data");
        }catch(err){
            this.emit("error", err);

            return false;
        }
    }
}