import {ITaskOptions} from "../definitions/tasks/TaskTypes";

export class MonitorService {
    constructor() {
        const task: ITaskOptions = {
            account: "",
            group: "",
            taskSettings: {
                type: "mint",
                data: "0xa0712d680000000000000000000000000000000000000000000000000000000000000001",
                price: 0,
                monitorSettings: {
                    timestamp: 1673058360,
                    mode: "timestamp"
                }
            },
            transactionSettings: {
                nodes: [""],
                gas: {
                    mode: "provided",
                    maxFeePerGas: 2,
                    priorityFee: 1
                },
                autoGas: false
            }
        }
    }
}