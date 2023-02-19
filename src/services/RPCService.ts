import {IRPC, IRPCIncomplete, IRPCOptions, IRPCStorage} from "../types/RPCTypes";
import {RPCSubscriber} from "../subscribers/RPCSubscriber";
import {nanoid} from "nanoid";
import {ConfigModel} from "../models/ConfigModel";
import {RPCEmitter} from "../emitters/RPCEmitter";

export class RPCService {
    private static rpcs: IRPCStorage;

    constructor() {
        RPCService.rpcs = ConfigModel.getRPCs();

        // Start the emitters
        for(let rpc of Object.values(RPCService.rpcs)){
            RPCSubscriber.create(rpc);
        }
    }

    static create(rpc: IRPCOptions): IRPC{
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
            throw new Error("Invalid RPC type")
        }

        // Create the object
        let incompleteRPC: IRPCIncomplete = {
            default: defaultRPC,
            type,
            id,
            name: rpc.name,
            url: rpc.url,
            settings: rpc.settings
        }

        const emitter = RPCSubscriber.create(incompleteRPC);
        if(emitter == null) throw new Error("emitter failed");

        // Overwrite the emitter and finalize object
        const finalizedRPC: IRPC = {
            ...incompleteRPC,
            emitter: emitter
        }


        ConfigModel.upsertRPC(finalizedRPC);
        this.rpcs[id] = finalizedRPC;

        return finalizedRPC;
    }

    static update(id: string, rpc: IRPCOptions): IRPC{
        // Verify RPC exists
        if(this.rpcs[id] == null){
            throw new Error("Invalid RPC ID provided")
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
            throw new Error("Invalid RPC type")
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

    static delete(id: string): void{
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
        }

        throw new Error("Invalid RPC ID provided")
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