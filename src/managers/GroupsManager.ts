import config from "../utils/StorageHandler";

export interface IGroup {
    name: string,
    target: string,
    type: "opensea" | "mint",
    id?: number
}

interface IGroupStored {
    [key: number]: IGroup
}

class GroupsManager {
    private groups: IGroupStored;
    private nextGroupId: number;

    constructor() {
        this.groups = {};
        // Check if config exists
        if(config.has("groups") && config.has("groupsId")) {
            // Make sure groups and groups id is good
            const configGroups: IGroupStored = config.get("groups") as IGroupStored;
            // Delete all groups and group ID if stored incorrectly
            if(configGroups == null) {
                config.delete("groups");
                this.nextGroupId = 0;
                return;
            }
            if(!this.isInteger(config.get("groupsId"))){
                config.delete("groupsId");
                this.nextGroupId = 0;
                return;
            }

            // Load from config
            for (let key of Object.keys(configGroups)) {
                const parsedKey = parseInt(key);

                this.groups[parsedKey] = configGroups[parsedKey];
            }
            this.nextGroupId = config.get("groupsId") as number;
        }else {
            this.nextGroupId = 0;
        }
    }

    createGroup(group: IGroup): boolean{
        if(group.id) return false;

        group.id = this.nextGroupId;

        this.groups[this.nextGroupId] = group;
        this.nextGroupId++;

        config.set(`groups.${group.id}`, group);
        config.set("groupsId", this.nextGroupId);

        return true;
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

    getGroup(id: number): IGroup | null{
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