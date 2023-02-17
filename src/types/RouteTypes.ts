import {FastifySchema} from "fastify";

type SchemaObject<T extends string> = {
    [k in T]: FastifySchema
}

export function schemaObject<T extends string>(s: SchemaObject<T>) {
    return s;
}

export default schemaObject;