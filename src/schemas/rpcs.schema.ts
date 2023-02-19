import {z} from "zod";
import schemaObject from "../types/RouteTypes";
import {IRPCIncomplete, IRPCOptions} from "../types/RPCTypes";
import {
    CreateRPCResponse,
    ErrorAPIResponse,
    GetRPCByIdResponse,
    GetRPCsResponse,
    SuccessAPIResponse,
    UpdateRPCResponse
} from "../types/ResponseTypes";

/*
Schema types
 */

const rpcOptions = z.object({
    name: z.string(),
    url: z.string(),
    settings: z.object({
        pollingInterval: z.number()
    }),
    default: z.boolean().optional()
}) satisfies z.ZodType<IRPCOptions>

const rpc = rpcOptions.extend({
    id: z.string(),
    default: z.boolean(),
    type: z.union([z.literal("ws"), z.literal("http")])
}) satisfies z.ZodType<IRPCIncomplete>;

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

const getRpcByIdResponse = successResponse.extend({
    data: rpc
}) satisfies z.ZodType<GetRPCByIdResponse>;

const getRPCs = successResponse.extend({
    data: rpc.array()
}) satisfies z.ZodType<GetRPCsResponse>;

const updateRPCs = successResponse.extend({
    data: rpc
}) satisfies z.ZodType<UpdateRPCResponse>;

const createRPC = successResponse.extend({
    data: rpc
}) satisfies z.ZodType<CreateRPCResponse>;

const rpcSchemas = schemaObject({
    GET_RPCS: {
        description: "Get all RPCs",
        operationId: "getRPCs",
        response: {
            "2xx": getRPCs,
            "5xx": errorResponse
        }
    },
    GET_RPC_BY_ID: {
        description: "Get RPC by specified ID",
        operationId: "getRPCById",
        response: {
            "2xx": getRpcByIdResponse,
            "5xx": errorResponse
        }
    },
    CREATE_RPC: {
        description: "Create RPC with specified RPC options",
        operationId: "createRPC",
        response: {
            "2xx": createRPC,
            "5xx": errorResponse
        }
    },
    UPDATE_RPC: {
        description: "Updates RPC of provided ID with provided update options",
        operationId: "updateRPC",
        response: {
            "2xx": updateRPCs,
            "5xx": errorResponse
        }
    },
    DELETE_RPC: {
        description: "Deletes RPC with provided id",
        operationId: "deleteRPC",
        response: {
            "2xx": successResponse,
            "5xx": errorResponse
        }
    }
})

export default rpcSchemas;