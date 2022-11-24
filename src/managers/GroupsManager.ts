export interface IGroup {
    name: string,
    target: string,
    type: "opensea" | "mint",
    id?: number
}

class GroupsManager {
    private groups: {
        [key: number]: IGroup
    }
    private nextGroupId: number;

    constructor() {
        this.groups = {};
        this.nextGroupId = 0;
    }

    createGroup(group: IGroup): boolean{
        if(group.id) return false;

        this.groups[this.nextGroupId] = group;
        this.nextGroupId++;

        return true;
    }

    editGroup(group: IGroup): boolean{
        if(group.id == null) return false;
        this.groups[group.id] = group;

        return true;
    }

    deleteGroup(id: number): void {
        delete this.groups[id];
    }

    getGroup(id: number): IGroup | null{
        return this.groups[id];
    }

    getGroups(): IGroup[]{
        return Object.values(this.groups);
    }
}

const groupsManager = new GroupsManager();

export default groupsManager;