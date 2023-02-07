import {ITask} from "../types/TaskTypes";
import {FlashMonitorClient} from "../clients/FlashMonitorClient";
import {IMonitorTaskOptions} from "../types/TaskMonitorTypes";

export class MonitorService {
    constructor() {
    }

    static async monitor(task: ITask) {


        if(task.mode.type === "follow"){
            const monitorTask: IMonitorTaskOptions = {
                contract: task.mode.destinationToWatch,
                owner: task.mode.addressToWatch,
                data: task.mode.dataToWatch
            }

            return await FlashMonitorClient.follow(monitorTask);
        }else if(task.mode.type === "timestamp"){

        }else if(task.mode.type === "custom"){

        }else{
            // THROW ERROR
            throw new Error("bruv")
        }
    }

    static async unmonitor(taskId: string) {
        // TODO Cancel monitoring task
    }
}

new MonitorService();