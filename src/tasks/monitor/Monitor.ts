import {EventEmitter} from "events";
import axios from "axios";
import {MONITOR_URL} from "../../utils/Constants";
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
        axios({
            url: `${MONITOR_URL}authentication/verify`,
            method: "POST",
            data: {
                license: "abc",
                identifier: "123",
            }
        }).then((resp) => {
            if(resp?.data?.success){
                const authToken = resp.data.token;

                this.token = authToken;

                this.initializeWebsocket();
            }else{
                this.emit("error", new Error("No success value found in reply - possible invalid license"));
            }
        }).catch(err => {
            this.emit("error", err);
        })
    }

    private async initializeWebsocket(){
        const ws: WebSocket = new WebSocket("ws://localhost:8080/ws",{
            headers: {
                "x-auth": this.token
            }
        });

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