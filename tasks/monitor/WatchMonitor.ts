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




}