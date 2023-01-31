import axios from "axios";
import {MONITOR_URL} from "../utils/Constants";
import {WebSocket} from "ws";
import {EventEmitter} from "events";
import {FollowAPISubscription} from "../subscriptions/FollowAPISubscription";
import {WatchTaskInfo} from "../../tasks/monitor/Monitor";
import {FollowAPITask} from "../types/FollowAPITypes";

export class FollowAPIService{

    private ws: WebSocket;
    private static token: string;
    public static subscriber: FollowAPISubscription;
    private static ready: boolean = false;

    constructor() {
        this.authenticate();
    }

    public static async follow(taskInfo: FollowAPITask): Promise<string | false> {
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
                FollowAPIService.token = resp.data.token;

                this.connect();
            }else{
                throw new Error("No success value found in reply - possible invalid license");
            }
        }).catch(err => {
            throw err;
        })
    }

    private connect(){
        this.ws = new WebSocket("ws://localhost:8080/ws",{
            headers: {
                "x-auth": FollowAPIService.token
            }
        });

        FollowAPIService.ready = true;
        FollowAPIService.subscriber = new FollowAPISubscription(this.ws);
    }

    static isReady(){
        return this.ready;
    }

}