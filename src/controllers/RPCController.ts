import {FastifyRequest} from "fastify";
import {IRPCOptions} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";
import {IDParam} from "../types/QueryParamTypes";
import {wrap} from "../helpers/APIResponseWrapper";
import {APIResponse} from "../types/ResponseTypes";

export class RPCController {
    static create(request: FastifyRequest): APIResponse {
        const rpc = request.body as IRPCOptions;

        return wrap((rpc) => {
            return {
                success: true,
                error: null,
                data: RPCService.create(rpc)
            };
        })(rpc);
    }

    static get(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;

        return wrap((id) => {
            if(id){
                return {
                    success: true,
                    error: null,
                    data: RPCService.get(id)
                }
            }else{
                return {
                    success: true,
                    error: null,
                    data: RPCService.getAll()
                };
            }
        })(id);
    }

    static update(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;
        const rpc = request.body as IRPCOptions;

        return wrap((id, rpc) => {
            return {
                success: true,
                error: null,
                data: RPCService.update(id, rpc)
            };
        })(id, rpc);
    }

    static delete(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;

        return wrap((id) => {
            RPCService.delete(id)

            return {
                success: true,
                error: null,
                data: {}
            };
        })(id);
    }
}