import {SuccessResponse} from "../types/ResponseTypes";
import {ITask} from "../types/TaskTypes";
import {IMintTaskOptions} from "../types/TaskOptionTypes";
import {FollowAPITask} from "../types/FollowAPITypes";
import {IMintFollowOptions} from "../types/TaskMonitorTypes";
import {FollowAPIService} from "../services/FollowAPIService";
import {FollowMonitorSubscription} from "../emitters/FollowMonitorSubscription";

export class MonitorSubscriber {

    static createSubscription(task: ITask): SuccessResponse {
        if(task.taskSettings.type === "mint"){
            const taskSettings = task.taskSettings as IMintTaskOptions;

            if(taskSettings.monitorSettings.mode === "timestamp"){

            }else if(taskSettings.monitorSettings.mode === "mint"){
                if(!FollowAPIService.isReady()){
                    return {
                        success: false,
                        message: "Follow API has not connected yet. Try again later."
                    }
                }
                const monitorSettings = taskSettings.monitorSettings as IMintFollowOptions;
                const monitorTask: FollowAPITask = {
                    contract: monitorSettings.toAddress,
                    owner: monitorSettings.fromAddress,
                    data: monitorSettings.data
                }

                FollowAPIService.follow(monitorTask).then((result) => {
                    if(result){
                        // TODO Probably allow for tracking and cancelling these emitters
                        new FollowMonitorSubscription(task, result);
                    }
                })
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