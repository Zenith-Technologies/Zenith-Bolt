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

class RPCManager extends EventEmitter{
    private rpc :IRPCStorage
    private instances: IRPCInstanceStorage;

    constructor() {
        super();

        this.instances = {};
        this.rpc = config.get("rpc",{}) as IRPCStorage;

        for(let rpcId in this.rpc){
            const rpc = this.rpc[rpcId];

            if(rpc.type === "http"){
                this.instances[rpcId] = new ethers.providers.JsonRpcProvider(rpc.url);
            }else if(rpc.type === "ws"){
                this.instances[rpcId] = new ethers.providers.WebSocketProvider(rpc.url);
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
            this.instances[id] = new ethers.providers.JsonRpcProvider(finalizedRPC.url);
        }else if(finalizedRPC.type === "ws"){
            this.instances[id] = new ethers.providers.WebSocketProvider(finalizedRPC.url);
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
            delete this.instances[id];

            config.set("rpc", this.rpc);
        }
    }
}

const rpcManager = new RPCManager()
export default rpcManager