import {IGroup} from "./GroupTypes";
import {IRPC, IRPCIncomplete} from "./RPCTypes";
import {IWallet, IWalletGroup} from "./WalletTypes";

export interface SuccessAPIResponse {
    success: true,
    data: {}
    error: null
}

export type ErrorAPIResponse = {
    success: false,
    data: null,
    error: {
        message: string,
        stack: string
    }
}

export type APIResponse = SuccessAPIResponse | ErrorAPIResponse;

/*
Group response types
 */
export interface GetGroupByIdResponse extends SuccessAPIResponse{
    data: IGroup
}

export interface GetGroupsResponse extends SuccessAPIResponse{
    data: IGroup[]
}

export interface UpdateGroupResponse extends SuccessAPIResponse {
    data: IGroup
}

export interface CreateGroupResponse extends SuccessAPIResponse {
    data: IGroup
}

/*
RPC Response Types
 */

export interface GetRPCByIdResponse extends SuccessAPIResponse {
    data: IRPCIncomplete
}

export interface GetRPCsResponse extends SuccessAPIResponse {
    data: IRPCIncomplete[]
}

export interface CreateRPCResponse extends SuccessAPIResponse {
    data: IRPCIncomplete
}

export interface UpdateRPCResponse extends SuccessAPIResponse {
    data: IRPCIncomplete
}

/*
Wallet response types
 */
export interface GetWalletGroupByIdResponse extends SuccessAPIResponse {
    data: IWalletGroup
}

export interface GetWalletsGroupResponse extends SuccessAPIResponse {
    data: IWalletGroup[]
}

export interface UpdateWalletGroupResponse extends SuccessAPIResponse {
    data: IWalletGroup
}

export interface CreateWalletGroupResponse extends SuccessAPIResponse {
    data: IWalletGroup
}

export interface AddWalletToGroupResponse extends SuccessAPIResponse {
    data: IWallet
}