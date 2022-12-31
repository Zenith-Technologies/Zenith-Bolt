import EventEmitter from "events";
import {nanoid} from "nanoid";
import config from "../utils/StorageHandler";

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

class RPCManager extends EventEmitter{
    private rpc :IRPCStorage

    constructor() {
        super();

        this.rpc = config.get("rpc",{}) as IRPCStorage

    }

    addRPC(rpc: IRPCOptions){
        const id = nanoid()

        const type = rpc.url.startsWith("ws")?"ws":(rpc.url.startsWith("http")?"http":false)
        if (type == false) return;

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

        this.rpc[id] = finalizedRPC;

        config.set("rpc",this.rpc)
    }

    removeRPC(id: string){
        if (this.rpc[id]){
            delete this.rpc[id]
            config.set("rpc",this.rpc)
        }
    }
}

const rpcManager = new RPCManager()
export default rpcManager