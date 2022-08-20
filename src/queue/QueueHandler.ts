import {Job, Worker} from 'bullmq';
import {RawTask} from "../types/RawTask";
import {MonitorHandler} from "../monitors/MonitorHandler";
import {MonitorResponse} from "../types/monitor/MonitorResponse";
import {FlipStateHandler} from "../tasks/mint/FlipStateHandler";

export default class QueueHandler {
    private worker: Worker;
    private monitor: MonitorHandler;

    constructor() {
        this.worker = new Worker("tasks", this.handleJob);
        this.monitor = new MonitorHandler();
    }

    async handleJob(job: Job){
        const data: RawTask = job.data as RawTask;

        this.monitor.addToMonitor(data, (response: MonitorResponse) => {

        })
    }
}