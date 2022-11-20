import {FastifyReply, FastifyRequest} from "fastify";

export interface TaskHandler {
    processRequest(request: FastifyRequest, reply: FastifyReply): Promise<Object>
}