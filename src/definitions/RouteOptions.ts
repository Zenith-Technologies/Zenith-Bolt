import {FastifyReply, FastifyRequest, FastifySchema} from "fastify";
import {JSONObject} from "./JSONTypes";

export interface RouteOptions {
    method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'PATCH' | 'OPTIONS',
    url: string,
    handler: (request: FastifyRequest, reply: FastifyReply) => Promise<JSONObject>,
    schema?: object
}