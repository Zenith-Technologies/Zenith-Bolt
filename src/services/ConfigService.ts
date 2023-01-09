import Conf from "conf";
import {IGroup, IGroupStorage} from "../types/GroupTypes";
import {IRPC, IRPCStorage} from "../types/RPCTypes";

export class ConfigService {
    private static config: Conf;

    constructor() {
        ConfigService.config = new Conf();
    }

    static getGroups(): IGroupStorage {
        // TODO Verify groups adhere to interface
        return this.config.get("groups", {}) as IGroupStorage;
    }

    static upsertGroup(group: IGroup) {
        this.config.set(`groups.${group.id}`, group);
    }

    static deleteGroup(group: IGroup) {
        this.config.delete(`groups.${group.id}`);
    }

    static getRPCs(): IRPCStorage {
        // TODO Verify RPCs adhere to interface
        return this.config.get("rpcs", {}) as IRPCStorage;
    }

    static upsertRPC(rpc: IRPC) {
        this.config.set(`rpcs.${rpc.id}`, rpc);
    }

    static deleteRPC(rpc: IRPC) {
        this.config.delete(`rpcs.${rpc.id}`);
    }

}

new ConfigService();