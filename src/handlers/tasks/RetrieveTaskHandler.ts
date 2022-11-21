import {TaskHandler} from "../TaskHandler";
import {FastifyReply, FastifyRequest} from "fastify";
import {JSONObject} from "../../definitions/JSONTypes";

export class RetrieveTaskHandler implements TaskHandler{

    async processRequest(request: FastifyRequest, reply: FastifyReply): Promise<JSONObject> {
        return {};
    }
}