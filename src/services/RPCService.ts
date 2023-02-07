import {IRPC, IRPCOptions, IRPCStorage} from "../types/RPCTypes";
import {RPCSubscriber, RPCEmitter} from "../subscribers/RPCSubscriber";
import {nanoid} from "nanoid";
import {ConfigModel} from "../models/ConfigModel";
import {SuccessResponse} from "../types/ResponseTypes";

export class RPCService {
    private static rpcs: IRPCStorage;

    constructor() {
        RPCService.rpcs = ConfigModel.getRPCs();

        // Start the emitters
        for(let rpc of Object.values(RPCService.rpcs)){
            RPCSubscriber.create(rpc);
        }
    }

    static create(rpc: IRPCOptions): IRPC | SuccessResponse{
        let id = nanoid();

        // Decides if RPC should become the default
        let defaultRPC = rpc.default ?? false;
        if(Object.keys(this.rpcs).length === 0){
            defaultRPC = true;
        }

        // If new default, disable the others
        if(defaultRPC){
            this.disableDefaults();
        }

        // Derives type from URL
        let type: "ws" | "http" | null = this.deriveType(rpc.url);

        if(type == null){
            // TODO Return error
            return {
                success: false,
                message: "invalid rpc url type"
            };
        }

        const emitter = RPCSubscriber.create(finalizedRPC);
        if(emitter == null) throw new Error("emitter failed");

        // Finalizes object
        const finalizedRPC: IRPC = {
            default: defaultRPC,
            type,
            id,
            name: rpc.name,
            url: rpc.url,
            settings: rpc.settings,
            emitter: emitter
        }


        ConfigModel.upsertRPC(finalizedRPC);
        this.rpcs[id] = finalizedRPC;

        return finalizedRPC;
    }

    static update(id: string, rpc: IRPCOptions): IRPC | SuccessResponse {
        // Verify RPC exists
        if(this.rpcs[id] == null){
            return {
                success: false,
                message: "nonexistent id"
            }
        }

        // Create default boolean
        let defaultRPC = rpc.default ?? false;

        // Swap all other RPC default value to false if new update is true
        if(defaultRPC){
            this.disableDefaults();
        }

        // Determine RPC type
        let type = this.deriveType(rpc.url);
        if(type == null){
            // TODO Return error
            return {
                success: false,
                message: "invalid rpc url"
            };
        }

        // Construct RPC object
        const finalizedRPC: IRPC = {
            default: defaultRPC,
            type,
            id,
            name: rpc.name,
            url: rpc.url,
            settings: rpc.settings,
            emitter: this.rpcs[id].emitter
        }

        RPCSubscriber.update(finalizedRPC);
        ConfigModel.upsertRPC(finalizedRPC);
        this.rpcs[id] = finalizedRPC;

        return finalizedRPC;
    }

    static get(id: string): IRPC{
        return this.rpcs[id];
    }

    static getAll(): IRPC[] {
        return Object.values(this.rpcs);
    }

    static delete(id: string): SuccessResponse {
        if(this.rpcs[id]){
            const rpc = this.rpcs[id];

            // Change default if the deleted one was the default
            let changeDefault = rpc.default;

            RPCSubscriber.delete(rpc.id);
            ConfigModel.deleteRPC(rpc);

            delete this.rpcs[id];

            if(changeDefault && Object.keys(this.rpcs).length > 0){
                Object.values(this.rpcs)[0].default = true;
            }

            return {
                success: true
            };
        }
        return {
            success: false,
            message: "Provided RPC ID does not exist"
        };
    }

    private static deriveType(url: string): "ws" | "http" | null {
        return url.startsWith("ws") ? "ws" : (url.startsWith("http") ? "http" : null);
    }

    private static disableDefaults(){
        for(let rpc of Object.values(this.rpcs)){
            rpc.default = false;
        }
    }
}

new RPCService();