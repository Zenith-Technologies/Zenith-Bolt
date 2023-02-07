import {IRPC, IRPCInstance, IRPCInstanceStorage} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";
import {ethers} from "ethers";
import {EventEmitter} from "events";
import {RPCEmitter} from "../emitters/RPCEmitter";

export class RPCSubscriber {
    private static instances: IRPCInstanceStorage;

    constructor() {
        RPCSubscriber.instances = {};
    }

    // Creates a new RPC instance
    static create(rpc: IRPC): RPCEmitter | null{
        let provider: ethers.providers.BaseProvider | null = this.createProvider(rpc);

        if(provider){
            const emitter = new RPCEmitter(provider);

            const instance: IRPCInstance = {
                provider,
                subscription: new RPCEmitter(provider)
            };

            this.instances[rpc.id] = instance;
            return emitter;
        }

        return null;
    }

    // Internal class to create a provider
    private static createProvider(rpc: IRPC): ethers.providers.BaseProvider | null {
        // Creates a different provider type depending on provided URL
        if(rpc.type === "ws"){
            return new ethers.providers.WebSocketProvider(rpc.url);
        }else if(rpc.type === "http"){
            const provider = new ethers.providers.StaticJsonRpcProvider(rpc.url);
            provider.pollingInterval = rpc.settings.pollingInterval;

            return provider;
        }

        return null;
    }

    // Updates an IRPC instance and its subscription
    static update(rpc: IRPC): RPCEmitter | null {
        if(this.instances[rpc.id] == null) return null;

        const provider = this.createProvider(rpc);

        if(provider){
            this.instances[rpc.id].subscription.update(provider);

            this.instances[rpc.id].provider = provider;

            return this.instances[rpc.id].subscription;
        }
        return null;
    }

    // Retrieves an IRPCInstance by ID
    static get(id: string): IRPCInstance | null {
        return this.instances[id];
    }

    // Deletes an IRPCInstance by ID
    static delete(id: string): boolean {
        if(this.instances[id]){
            this.instances[id].subscription.delete();
            delete this.instances[id];
        }
        return false;
    }

}