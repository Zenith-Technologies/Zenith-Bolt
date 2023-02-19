import {ConfigModel} from "../models/ConfigModel";
import {IGroup, IGroupCreateOptions, IGroupStorage} from "../types/GroupTypes";
import {nanoid} from "nanoid";

export class GroupsService {

    private static groups: IGroupStorage;

    constructor() {
        GroupsService.groups = ConfigModel.getGroups();
    }

    // TODO Handle errors
    static upsert(group: IGroupCreateOptions, id: string = nanoid()): IGroup{
        const createdGroup: IGroup = {
            id, ...group
        };

        this.groups[id] = createdGroup;

        ConfigModel.upsertGroup(createdGroup);

        return createdGroup;
    }

    static get(id: string): IGroup{
        const group = this.groups[id];

        // Check if group with ID existed or not
        if(group == null){
            throw new Error("Group does not exist");
        }
        return group;
    }

    static getAll(): IGroup[]{
        return Object.values(this.groups);
    }

    static delete(id: string): void{
        const group = this.groups[id];
        if(group) {
            // TODO Delete all tasks belonging to group
            // TasksService.deleteGroup(group);
            ConfigModel.deleteGroup(group);
            delete this.groups[id];
        }
        throw new Error("Group does not exist");
    }
}

new GroupsService();