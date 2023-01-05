import config from "../utils/StorageHandler";
import {nanoid} from "nanoid";

export interface IGroup extends IGroupOptions {
    id: string
}

interface IGroupOptions {
    name: string,
    target: string,
    type: "opensea" | "mint",
}

interface IGroupStored {
    [key: string]: IGroup
}

class GroupsManager {
    private groups: IGroupStored;

    constructor() {
        this.groups = {};
        // Check if config exists
        if(config.has("groups") && config.has("groupsId")) {
            // Make sure groups and groups id is good
            const configGroups: IGroupStored = config.get("groups") as IGroupStored;
            // Delete all groups and group ID if stored incorrectly
            if(configGroups == null) {
                config.delete("groups");
                return;
            }

            // Load from config
            for (let key of Object.keys(configGroups)) {
                const parsedKey = parseInt(key);

                this.groups[parsedKey] = configGroups[parsedKey];
            }
        }
    }

    // TODO Validate target before allowing group creation
    createGroup(groupOptions: IGroupOptions): IGroup | null{
        const id = nanoid();

        const group: IGroup = {
            id, ...groupOptions
        }

        this.groups[group.id] = group;

        config.set(`groups.${group.id}`, group);

        return group;
    }

    editGroup(group: IGroup): boolean{
        if(group.id == null) return false;
        this.groups[group.id] = group;

        config.set(`groups.${group.id}`, group);

        return true;
    }

    deleteGroup(id: number): void {
        config.delete(`groups.${id}`);
        delete this.groups[id];
    }

    getGroup(id: string): IGroup | null{
        return this.groups[id];
    }

    getGroups(): IGroup[]{
        return Object.values(this.groups);
    }

    private isInteger(variable: any): boolean{
        try{
            parseInt(variable);
            return true;
        }catch(err){
            return false;
        }
    }
}

const groupsManager = new GroupsManager();

export default groupsManager;