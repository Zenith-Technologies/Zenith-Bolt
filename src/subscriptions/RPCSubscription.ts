import {EventEmitter} from "events";
import {ethers} from "ethers";

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
    public update(provider: ethers.providers.BaseProvider){
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
        console.log("emitting block", blockNumber);
        this.emit("block", blockNumber);

        const block = await this.provider.getBlock(blockNumber);
        this.emit("fullBlock", block);
    }
}