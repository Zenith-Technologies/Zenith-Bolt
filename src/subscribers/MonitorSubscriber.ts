import {SuccessResponse} from "../types/ResponseTypes";
import {ITask} from "../types/TaskTypes";
import {IMintTaskOptions} from "../types/TaskOptionTypes";

export class MonitorSubscriber {
    static createSubscription(task: ITask): SuccessResponse {
        if(task.taskSettings.type === "mint"){
            const taskSettings = task.taskSettings as IMintTaskOptions;

            if(taskSettings.monitorSettings.mode === "timestamp"){

            }else if(taskSettings.monitorSettings.mode === "mint"){

            }
        }else if(task.taskSettings.type === "custom"){

        }else{
            return {
                success: false,
                message: "Invalid task settings provided"
            }
        }
    }
}