import {Type} from "@sinclair/typebox";
import {FastifySchema} from "fastify";
import schemaObject from "../types/RouteTypes";
import {IGroupCreateOptions} from "../types/GroupTypes";

const groupID = Type.Object({
    id: Type.String()
})

const createGroupOptions = Type.Object({
    name: Type.String(),
    // TODO Validate if this matches the regex for an eth address if type is mint
    target: Type.String(),
    type: Type.Union([Type.Literal("opensea"), Type.Literal("mint")])
});

const groupSchemas = schemaObject({
    GET_GROUPS: {
        description: "Gets all groups",
        querystring: Type.Object({})
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