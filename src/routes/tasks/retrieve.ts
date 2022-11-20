import {FastifyReply, FastifyRequest} from "fastify";
import {RouteOptions} from "../../definitions/RouteOptions";
import {RetrieveTaskHandler} from "../../handlers/tasks/RetrieveTaskHandler";
import schema from "../../schemas/tasks/retrieve.json";

const options: RouteOptions = {
    method: 'GET',
    url: '/task/:id',
    handler: handler,
    schema: schema
}

const taskHandler: RetrieveTaskHandler = new RetrieveTaskHandler();

async function handler(request: FastifyRequest, reply: FastifyReply){
    return taskHandler.processRequest(request, reply);
}

export default options;