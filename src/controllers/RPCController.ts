import {FastifyRequest} from "fastify";
import {IRPCOptions} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";
import {IDParam} from "../types/QueryParamTypes";

export class RPCController {
    static create(request: FastifyRequest) {
        const rpc = request.body as IRPCOptions;

        return RPCService.create(rpc);
    }

    static get(request: FastifyRequest) {
        const {id} = request.params as IDParam;

        if(id){
            return RPCService.get(id);
        }else{
            return RPCService.getAll();
        }
    }

    static update(request: FastifyRequest) {
        const {id} = request.params as IDParam;
        const rpc = request.body as IRPCOptions;

        return RPCService.update(id, rpc);
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params as IDParam;

        return RPCService.delete(id);
    }
}