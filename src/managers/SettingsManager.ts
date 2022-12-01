import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";

export interface ISettings {
    rpcs: {
        [key: string]: IRPC
    }
}

export interface IRPCOptions {
    default?: boolean,
    name: string,
    url: string
    type: "http" | "ws"
}

interface IRPC {
    id: string,
    default: boolean,
    name: string,
    url: string
    type: "http" | "ws"
}

export interface ISettingsOptions {
    rpcs: {
        [key: string]: IRPCOptions
    }
}

class SettingsManager {
    private settings: ISettings;

    constructor() {
        this.settings = {
            rpcs: {}
        }

        if(config.has("settings")){
            this.settings = config.get("settings") as ISettings;
        }
    }

    fetchSettings(){
        return JSON.parse(JSON.stringify(this.settings));
    }

    updateSettings(newSettings: ISettingsOptions){
        const toSet: ISettings = {
            rpcs: {}
        }
        let count = Object.values(newSettings.rpcs).length;
        for(let [key, value] of Object.entries(newSettings.rpcs)){
            toSet.rpcs[key] = {
                default: value.default ?? count === 1,
                name: value.name,
                url: value.url,
                type: value.type,
                id: key
            };
        }

        config.set("settings", toSet);
        this.settings = toSet;
    }
}

const settingsManager = new SettingsManager();

export default settingsManager;