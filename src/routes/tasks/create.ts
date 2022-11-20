import {FastifyReply, FastifyRequest} from "fastify";
import {RouteOptions} from "../../definitions/RouteOptions";
import {CreateTaskHandler} from "../../handlers/tasks/CreateTaskHandler";
import schema from "../../schemas/tasks/create.json";

const options: RouteOptions = {
    method: 'POST',
    url: '/task',
    handler: handler,
    schema: schema
}

const taskHandler: CreateTaskHandler = new CreateTaskHandler();

async function handler(request: FastifyRequest, reply: FastifyReply){
    return taskHandler.processRequest(request, reply);
}

export default options;