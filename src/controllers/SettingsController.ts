import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";

export interface ISettings {
    [key: string]: string
}

export interface ISettingsOptions {
    [key: string]: string
}

class SettingsController {
    private settings: ISettings;

    constructor() {
        this.settings = {}

        if(config.has("settings")){
            this.settings = config.get("settings") as ISettings;
        }
    }

    get(){
        return JSON.parse(JSON.stringify(this.settings));
    }

    // Updates all new settings (can pass just an empty object and nothing would update)
    upsert(newSettings: ISettingsOptions){
        const toSet: ISettings = {};

        for(let settingName in newSettings){
            const setting = newSettings[settingName];

            if(setting !== "" && this.settings[settingName] !== setting){
                this.settings[settingName] = setting;
            }
        }

        config.set("settings", this.settings);
    }
}

const settingsController = new SettingsController();

export default settingsController;