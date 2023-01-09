import {IRPC, IRPCInstance, IRPCInstanceStorage} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";
import {ethers} from "ethers";
import {EventEmitter} from "events";

export class RPCSubscriber {
    private static instances: IRPCInstanceStorage;

    constructor() {
        RPCSubscriber.instances = {};
    }

    // Creates a new RPC instance
    static create(rpc: IRPC): IRPCInstance | null{
        let provider: ethers.providers.BaseProvider | null = this.createProvider(rpc);

        if(provider){
            const instance: IRPCInstance = {
                provider,
                subscription: new RPCSubscription(provider)
            };

            this.instances[rpc.id] = instance;
            return instance;
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
    static update(rpc: IRPC): IRPCInstance | null {
        if(this.instances[rpc.id] == null) return null;

        const provider = this.createProvider(rpc);

        if(provider){
            this.instances[rpc.id].subscription.update(provider);

            this.instances[rpc.id].provider = provider;

            return this.instances[rpc.id];
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

export class RPCSubscription extends EventEmitter{
    private provider: ethers.providers.BaseProvider;

    // Subscribes to block events and emits them through the event emitter
    constructor(provider: ethers.providers.BaseProvider) {
        super();

        this.provider = provider;

        this.provider.on("block", this.blockHandler)

        this.emit("ready");
    }

    // Updates the provider used for events
    update(provider: ethers.providers.BaseProvider){
        provider.on("block", this.blockHandler);

        this.provider.removeAllListeners();

        this.provider = provider;
        this.emit("updated");
    }

    // Clears all listeners and emits deleted event for tasks
    delete(){
        this.emit("deleted");
        this.removeAllListeners();
    }

    // Handles emitting block events
    private async blockHandler(blockNumber: number) {
        this.emit("block", blockNumber);

        const block = await this.provider.getBlock(blockNumber);
        this.emit("fullBlock", block);
    }
}