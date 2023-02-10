// This is a single file that wraps around Zenith-Flash (flipstate alerts)
import axios from "axios";
import {MONITOR_URL} from "../utils/Constants";
import WebSocket from "ws";
import {EventEmitter} from "events";
import {FlashMonitorEmitter} from "../emitters/FlashMonitorEmitter";
import {IMonitorTask, IMonitorTaskOptions} from "../types/TaskMonitorTypes";

export class FlashMonitorClient {
    private ws: WebSocket | undefined;
    private static token: string;
    private static ready: boolean = false;
    private static monitorEmitter: FlashMonitorEmitter;

    public static emitter: EventEmitter;

    constructor() {
        FlashMonitorClient.emitter = new EventEmitter();
        this.authenticate();
    }

    public static async follow(taskInfo: IMonitorTaskOptions): Promise<{
        task: IMonitorTask,
        emitter: EventEmitter
    } | false> {
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
                const task: IMonitorTask = {
                    id: resp.data.id,
                    ...taskInfo
                }

                const emitter = this.monitorEmitter.add(task);

                return {
                    task, emitter
                };
            } else {
                throw new Error("No success value found in reply - possible invalid license");
            }
        }catch(err){
            throw err;
        }
    }

    public static async unfollow(taskId: string): Promise<boolean> {
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
            FlashMonitorClient.emitter.emit("err", err);
            throw err;
        }
    }

    private authenticate(){
        axios({
            url: `${MONITOR_URL}authentication/verify`,
            method: "POST",
            data: {
                license: "abc",
                identifier: "123",
            }
        }).then((resp) => {
            if(resp?.data?.success){
                FlashMonitorClient.token = resp.data.token;

                this.connect();
            }else{
                throw new Error("No success value found in reply - possible invalid license");
            }
        }).catch(err => {
            FlashMonitorClient.emitter.emit("err", err);
            throw err;
        })
    }

    private connect(){
        this.ws = new WebSocket("ws://localhost:8080/ws",{
            headers: {
                "x-auth": FlashMonitorClient.token
            }
        });

        FlashMonitorClient.monitorEmitter = new FlashMonitorEmitter(this.ws);

        FlashMonitorClient.emitter.emit("ready");
        FlashMonitorClient.ready = true;
    }

    static isReady(){
        return this.ready;
    }
}

new FlashMonitorClient();