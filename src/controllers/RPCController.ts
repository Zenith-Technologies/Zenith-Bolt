import {FastifyRequest} from "fastify";
import {IRPCOptions} from "../types/RPCTypes";
import {RPCService} from "../services/RPCService";
import {IDParam} from "../types/QueryParamTypes";
import {wrap} from "../helpers/APIResponseWrapper";

export class RPCController {
    static create(request: FastifyRequest) {
        const rpc = request.body as IRPCOptions;

        wrap((rpc) => {
            return {
                success: true,
                error: null,
                data: RPCService.create(rpc)
            };
        })(rpc);
    }

    static get(request: FastifyRequest) {
        const {id} = request.params as IDParam;

        wrap((id) => {
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

    static update(request: FastifyRequest) {
        const {id} = request.params as IDParam;
        const rpc = request.body as IRPCOptions;

        wrap((id, rpc) => {
            return {
                success: true,
                error: null,
                data: RPCService.update(id, rpc)
            };
        })(id, rpc);
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params as IDParam;

        wrap((id) => {
            RPCService.delete(id)

            return {
                success: true,
                error: null,
                data: {}
            };
        })(id);
    }
}