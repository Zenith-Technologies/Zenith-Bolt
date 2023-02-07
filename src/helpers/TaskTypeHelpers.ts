// This class is used as a helper for task difference type inference

import {ICustomTask, ITask} from "../types/TaskTypes";
import {ICustomModuleTaskOptions, IMintTaskOptions} from "../types/TaskOptionTypes";

function getTaskSettingsType(taskSettings: ICustomModuleTaskOptions): ICustomModuleTaskOptions;
function getTaskSettingsType(taskSettings: IMintTaskOptions): IMintTaskOptions;
function getTaskSettingsType(taskSettings:IMintTaskOptions | ICustomModuleTaskOptions) {
    return taskSettings;
}
