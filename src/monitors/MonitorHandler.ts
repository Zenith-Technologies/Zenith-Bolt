import {ServerHandler} from "./ServerHandler";
import {MonitorEntry} from "../types/monitor/MonitorEntry";
import short from "short-uuid";
import {MonitorCallback, MonitorResponse} from "../types/monitor/MonitorResponse";
import {RawTask} from "../types/RawTask";

export class MonitorHandler {
    serverHandler: ServerHandler;
    monitoring: MonitorEntry;

    constructor() {
        this.serverHandler = new ServerHandler();
        this.monitoring = {};

        this.serverHandler.on("response", this.handleResponse);
    }

    private handleResponse(data: MonitorResponse){
        if(this.monitoring[data.id]){
            this.monitoring[data.id](data);
        }
    }

    public addToMonitor(taskInfo: RawTask, callback: MonitorCallback){
        const uniqueId = short.generate();

        // TODO send taskInfo to monitor

        this.monitoring[uniqueId] = callback;
    }
}