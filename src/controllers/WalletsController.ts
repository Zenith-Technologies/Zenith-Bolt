import {FastifyRequest} from "fastify";
import {WalletsService} from "../services/WalletsService";
import {IWalletGroupOptions, IWalletOptions} from "../types/WalletTypes";
import {Wallet} from "ethers";

export class WalletsController {
    static create(request: FastifyRequest) {
        const group = request.body as IWalletGroupOptions;

        return WalletsService.upsertGroup(group);
    }

    static get(request: FastifyRequest) {
        const {id} = request.params;

        if(id){
            return WalletsService.getGroup(id);
        }else{
            return WalletsService.getGroups();
        }
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params;

        return WalletsService.deleteGroup(id);
    }

    static update(request: FastifyRequest) {
        const {id} = request.params;
        const group = request.body as IWalletGroupOptions;

        return WalletsService.updateGroup(id, group.name)
    }

    static addWalletToGroup(request: FastifyRequest) {
        const {groupId} = request.params;
        const wallet = request.body as IWalletOptions;

        return WalletsService.addWalletToGroup(groupId, wallet);
    }

    static deleteWalletFromGroup(request: FastifyRequest) {
        const {groupId, walletId} = request.params;

        return WalletsService.removeWalletFromGroup(groupId, walletId);
    }
}