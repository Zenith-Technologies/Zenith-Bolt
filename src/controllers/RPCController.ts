import {FastifyRequest} from "fastify";
import {IRPCOptions} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";

export class RPCController {
    static create(request: FastifyRequest) {
        const rpc = request.body as IRPCOptions;

        return RPCService.create(rpc);
    }

    static get(request: FastifyRequest) {
        const {id} = request.params;

        if(id){
            return RPCService.get(id);
        }else{
            return RPCService.getAll();
        }
    }

    static update(request: FastifyRequest) {
        const {id} = request.params;
        const rpc = request.body as IRPCOptions;

        return RPCService.update(id, rpc);
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params;

        return RPCService.delete(id);
    }
}