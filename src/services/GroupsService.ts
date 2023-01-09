import {ConfigService} from "./ConfigService";
import {IGroup, IGroupCreateOptions, IGroupStorage} from "../types/GroupTypes";
import {nanoid} from "nanoid";
import {SuccessResponse} from "../types/ResponseTypes";

export class GroupsService {

    private static groups: IGroupStorage;

    constructor() {
        GroupsService.groups = ConfigService.getGroups();
    }

    // TODO Handle errors
    static upsert(group: IGroupCreateOptions, id: string = nanoid()): IGroup | null{
        const createdGroup: IGroup = {
            id, ...group
        };

        this.groups[id] = createdGroup;

        ConfigService.upsertGroup(createdGroup);

        return createdGroup;
    }

    static get(id: string): IGroup | null{
        const group = this.groups[id];

        // Check if group with ID existed or not
        if(group == null){
            return null;
        }
        return group;
    }

    static getAll(): IGroup[]{
        return Object.values(this.groups);
    }

    static delete(id: string): SuccessResponse{
        const group = this.groups[id];
        if(group) {
            // TODO Delete all tasks belonging to group
            // TasksService.deleteGroup(group);
            ConfigService.deleteGroup(group);
            delete this.groups[id];

            return {
                success: true
            };
        }
        return {
            success: false,
            message: "Provided group ID does not exist"
        }
    }
}

new GroupsService();