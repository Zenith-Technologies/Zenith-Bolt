import {FastifyRequest} from "fastify";
import {WalletsService} from "../services/WalletsService";
import {IWalletGroupOptions, IWalletOptions} from "../types/WalletTypes";
import {Wallet} from "ethers";
import {IDParam, WalletGroupIDParam} from "../types/QueryParamTypes";
import {wrap} from "../helpers/APIResponseWrapper";
import {APIResponse} from "../types/ResponseTypes";

export class WalletsController {
    static create(request: FastifyRequest): APIResponse {
        const group = request.body as IWalletGroupOptions;

        return wrap((group) => {
            return {
                success: true,
                error: null,
                data: WalletsService.upsertGroup(group)
            };
        })(group);
    }

    static get(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;

        return wrap((id) => {
            if(id){
                return {
                    success: true,
                    error: null,
                    data: WalletsService.getGroup(id)
                };
            }else{
                return {
                    success: true,
                    error: null,
                    data: WalletsService.getGroups()
                };
            }
        })(id);
    }

    static delete(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;

        return wrap((id) => {
            WalletsService.deleteGroup(id);

            return {
                success: true,
                error: null,
                data: {}
            }
        })(id);
    }

    static update(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;
        const group = request.body as IWalletGroupOptions;

        return wrap((id, group) => {
            return {
                success: true,
                error: null,
                data: WalletsService.updateGroup(id, group.name)
            }
        })(id, group);
    }

    static addWalletToGroup(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;
        const wallet = request.body as IWalletOptions;

        return wrap((id, wallet) => {
            return {
                success: true,
                error: null,
                data: WalletsService.addWalletToGroup(id, wallet)
            };
        })(id, wallet);
    }

    static deleteWalletFromGroup(request: FastifyRequest): APIResponse {
        const {groupId, walletId} = request.params as WalletGroupIDParam;

        return wrap((groupId, walletId) => {
            WalletsService.removeWalletFromGroup(groupId, walletId);

            return {
                success: true,
                error: null,
                data: {}
            }
        })(groupId, walletId);
    }
}