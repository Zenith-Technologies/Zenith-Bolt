import {z} from "zod";
import {FastifySchema} from "fastify";
import schemaObject from "../types/RouteTypes";
import {IGroupCreateOptions} from "../types/GroupTypes";
import {toZod} from "tozod";

const groupID = z.object({
    id: z.string()
})

const createGroupOptions = z.object({
    name: z.string(),
    // TODO Validate if this matches the regex for an eth address if type is mint
    target: z.string(),
    type: z.enum(["opensea", "mint"])
}) satisfies z.ZodType<IGroupCreateOptions>;



const groupSchemas = schemaObject({
    GET_GROUPS: {
        description: "Gets all groups"
    },
    GET_GROUP_BY_ID: {
        description: "Gets a group by ID",
        params: groupID
    },
    CREATE_GROUP: {
        description: "Creates a group from provided options",
        body: createGroupOptions
    },
    UPDATE_GROUP: {
        description: "Updates the provided group ID with provided options",
        params: groupID,
        body: createGroupOptions
    },
    DELETE_GROUP: {
        description: "Deletes the group with the provided group ID",
        params: groupID
    }
});

export default groupSchemas;