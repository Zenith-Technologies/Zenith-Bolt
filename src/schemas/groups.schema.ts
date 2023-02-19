import {z} from "zod";
import {FastifySchema} from "fastify";
import schemaObject from "../types/RouteTypes";
import {IGroupCreateOptions} from "../types/GroupTypes";
import {toZod} from "tozod";
import {
    CreateGroupResponse, DeleteGroupResponse,
    ErrorAPIResponse,
    GetGroupByIdResponse,
    GetGroupsResponse,
    SuccessAPIResponse,
    UpdateGroupResponse
} from "../types/ResponseTypes";

/*
Schema types
 */
const groupID = z.object({
    id: z.string()
})

const createGroupOptions = z.object({
    name: z.string(),
    // TODO Validate if this matches the regex for an eth address if type is mint
    target: z.string(),
    type: z.enum(["opensea", "mint"]),
}) satisfies z.ZodType<IGroupCreateOptions>;

const group = createGroupOptions.extend({
    id: z.string()
})

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

const getGroupByIdResponse = successResponse.extend({
    data: group
}) satisfies z.ZodType<GetGroupByIdResponse>;

const getGroupsResponse = successResponse.extend({
    data: group.array()
}) satisfies z.ZodType<GetGroupsResponse>;

const updateGroupResponse = successResponse.extend({
    data: group
}) satisfies z.ZodType<UpdateGroupResponse>;

const createGroupResponse = successResponse.extend({
    data: group
}) satisfies z.ZodType<CreateGroupResponse>;

const deleteGroupResponse = successResponse.extend({
    data: z.object({})
}) satisfies z.ZodType<DeleteGroupResponse>;

/*
Schema object
 */
const groupSchemas = schemaObject({
    GET_GROUPS: {
        description: "Gets all groups",
        operationId: "getGroups",
        response: {
            "2xx": getGroupsResponse,
            "5xx": errorResponse
        }
    },
    GET_GROUP_BY_ID: {
        description: "Gets a group by ID",
        params: groupID,
        operationId: "getGroupsById",
        response: {
            "2xx": getGroupByIdResponse,
            "5xx": errorResponse
        }
    },
    CREATE_GROUP: {
        description: "Creates a group from provided options",
        body: createGroupOptions,
        response: {
            "2xx": createGroupResponse,
            "5xx": errorResponse
        }
    },
    UPDATE_GROUP: {
        description: "Updates the provided group ID with provided options",
        params: groupID,
        body: createGroupOptions,
        response: {
            "2xx": updateGroupResponse,
            "5xx": errorResponse
        }
    },
    DELETE_GROUP: {
        description: "Deletes the group with the provided group ID",
        params: groupID,
        response: {
            "2xx": deleteGroupResponse,
            "5xx": errorResponse
        }
    }
});

export default groupSchemas;