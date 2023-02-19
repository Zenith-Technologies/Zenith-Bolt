import {z} from "zod";
import {
    AddWalletToGroupResponse,
    CreateWalletGroupResponse,
    ErrorAPIResponse,
    GetWalletGroupByIdResponse,
    GetWalletsGroupResponse,
    SuccessAPIResponse, UpdateWalletGroupResponse
} from "../types/ResponseTypes";
import {IWallet, IWalletGroup, IWalletGroupOptions, IWalletOptions} from "../types/WalletTypes";
import schemaObject from "../types/RouteTypes";

/*
Schema types
 */
const walletGroupID = z.object({
    id: z.string()
})

const walletID = z.object({
    groupId: z.string(),
    walletId: z.string()
})

const walletOptions = z.object({
    privateKey: z.string()
}) satisfies z.ZodType<IWalletOptions>;

const wallet = z.object({
    id: z.string(),
    address: z.string()
}) satisfies z.ZodType<IWallet>;

const walletGroupOptions = z.object({
    name: z.string(),
    wallets: walletOptions.array()
}) satisfies z.ZodType<IWalletGroupOptions>;

const walletGroup = z.object({
    id: z.string(),
    name: z.string(),
    wallets: wallet.array()
}) satisfies z.ZodType<IWalletGroup>;

const successResponse = z.object({
    success: z.literal(true),
    data: z.object({}),
    error: z.null()
}) satisfies z.ZodType<SuccessAPIResponse>;

const errorResponse = z.object({
    success: z.literal(false),
    data: z.null(),
    error: z.object({
        message: z.string(),
        stack: z.string()
    })
}) satisfies z.ZodType<ErrorAPIResponse>;

const getWalletGroupByIdResponse = successResponse.extend({
    data: walletGroup
}) satisfies z.ZodType<GetWalletGroupByIdResponse>;

const getWalletGroupsResponse = successResponse.extend({
    data: walletGroup.array()
}) satisfies z.ZodType<GetWalletsGroupResponse>;

const createWalletGroupResponse = successResponse.extend({
    data: walletGroup
}) satisfies z.ZodType<CreateWalletGroupResponse>;

const updateWalletGroupResponse = successResponse.extend({
    data: walletGroup
}) satisfies z.ZodType<UpdateWalletGroupResponse>;

const addWalletToWalletGroupResponse = successResponse.extend({
    data: wallet
}) satisfies z.ZodType<AddWalletToGroupResponse>;

const walletsSchema = schemaObject({
    GET_WALLET_GROUPS: {
        description: "Gets all wallet groups",
        operationId: "getWalletGroups",
        response: {
            "2xx": getWalletGroupsResponse,
            "5xx": errorResponse
        }
    },
    GET_WALLET_GROUP_BY_ID: {
        description: "Gets a wallet group with specified ID",
        operationId: "getWalletGroup",
        params: walletGroupID,
        response: {
            "2xx": getWalletGroupByIdResponse,
            "5xx": errorResponse
        }
    },
    UPDATE_WALLET_GROUP: {
        description: "Update a wallet group with the provided ID with the provided options",
        operationId: "updateWalletGroup",
        params: walletGroupID,
        body: walletGroupOptions,
        response: {
            "2xx": updateWalletGroupResponse,
            "5xx": errorResponse
        }
    },
    CREATE_WALLET_GROUP: {
        description: "Creates a wallet group with the provided options",
        operationId: "createWalletGroup",
        body: walletGroupOptions,
        response: {
            "2xx": createWalletGroupResponse,
            "5xx": errorResponse
        }
    },
    DELETE_WALLET_GROUP: {
        description: "Deletes wallet group with provided ID",
        operationId: "deleteWalletGroup",
        params: walletGroupID,
        response: {
            "2xx": successResponse,
            "5xx": errorResponse
        }
    },
    ADD_WALLET_TO_WALLET_GROUP: {
        description: "Adds wallet options to a specified wallet group",
        operationId: "addWalletToWalletGroup",
        params: walletGroupID,
        body: walletOptions,
        response: {
            "2xx": addWalletToWalletGroupResponse,
            "5xx": errorResponse
        }
    },
    DELETE_WALLET_FROM_WALLET_GROUP: {
        description: "Deletes a specified wallet from a specified wallet group",
        operationId: "deleteWalletFromWalletGroup",
        params: walletID,
        response: {
            "2xx": successResponse,
            "5xx": errorResponse
        }
    }
})

export default walletsSchema;