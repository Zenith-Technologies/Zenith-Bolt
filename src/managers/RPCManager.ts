import EventEmitter from "events";
import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";
import {ethers} from "ethers";

export interface IRPCOptions {
    default?: boolean,
    name: string,
    url: string
}

interface IRPC {
    id: string,
    default: boolean,
    name: string,
    url: string
    type: "http" | "ws"
}

interface IRPCStorage{
    [key: string]:IRPC
}

interface IRPCInstanceStorage {
    [key: string]: ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider;
}

interface IRPCCallback {
    (block: number): void
}

class RPCManager extends EventEmitter{
    private rpc :IRPCStorage
    private instances: IRPCInstanceStorage;
    private rpcBlocks: {
        [key: string]: number
    }

    constructor() {
        super();

        this.instances = {};
        this.rpcBlocks = {};
        this.rpc = config.get("rpc",{}) as IRPCStorage;

        for(let rpcId in this.rpc){
            const rpc = this.rpc[rpcId];

            // Add RPC and block event for callbacks
            if(rpc.type === "http"){
                const provider = new ethers.providers.JsonRpcProvider(rpc.url);

                // TODO Make this configurable
                provider.pollingInterval = 500;

                provider.on("block", (block) => {
                    this.rpcBlocks[rpcId] = block;
                })

                this.instances[rpcId] = provider;
            }else if(rpc.type === "ws"){
                this.instances[rpcId] = new ethers.providers.WebSocketProvider(rpc.url);

                this.instances[rpcId].on("block", (block) => {
                    this.rpcBlocks[rpcId] = block;
                })
            }
        }
    }

    addRPC(rpc: IRPCOptions): IRPC | null{
        const id = nanoid()

        const type = rpc.url.startsWith("ws")?"ws":(rpc.url.startsWith("http")?"http":false)
        if (type == false) return null;

        let rpcDefault = rpc.default??false;

        if (Object.keys(this.rpc).length === 0){
            rpcDefault = true
        }

        const finalizedRPC:IRPC = {
            url: rpc.url,
            name: rpc.name,
            id: id,
            default: rpcDefault,
            type: type
        }

        if(finalizedRPC.type === "http"){
            const provider = new ethers.providers.JsonRpcProvider(finalizedRPC.url);

            // TODO Make this configurable
            provider.pollingInterval = 500;

            provider.on("block", (block) => {
                this.rpcBlocks[id] = block;
            })

            this.instances[id] = provider;

        }else if(finalizedRPC.type === "ws"){
            const provider = new ethers.providers.WebSocketProvider(finalizedRPC.url);

            provider.on("block", (block) => {
                this.rpcBlocks[id] = block;
            })

            this.instances[id] = provider;
        }

        this.rpc[id] = finalizedRPC;

        config.set("rpc", this.rpc);

        return this.rpc[id];
    }

    getRPCInstance(id: string): ethers.providers.BaseProvider{
        return this.instances[id];
    }

    removeRPC(id: string){
        if (this.rpc[id]){
            delete this.rpc[id];

            this.instances[id].removeAllListeners("block");

            delete this.instances[id];
            delete this.rpcBlocks[id];

            config.set("rpc", this.rpc);
        }
    }

    getRPCBlock(id: string): number{
        return this.rpcBlocks[id] ?? -1;
    }
}

const rpcManager = new RPCManager()
export default rpcManager