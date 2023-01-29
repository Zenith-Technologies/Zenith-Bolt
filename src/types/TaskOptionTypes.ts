import {IMintFollowOptions, IMintTimestampOptions} from "./TaskMonitorTypes";

export interface ICustomModuleTaskOptions {
    type: "custom",
    // Name of module to run
    module: string,
    // Data to pass to module
    data: string
}

export interface IMintTaskOptions {
    type: "mint",
    // Data to send with txn
    data: string,
    // Price to send with txn
    price: number,
    // Monitor settings
    monitorSettings: IMintFollowOptions | IMintTimestampOptions
}