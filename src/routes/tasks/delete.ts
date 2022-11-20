import {FastifyReply, FastifyRequest} from "fastify";
import {RouteOptions} from "../../definitions/RouteOptions";
import {DeleteTaskHandler} from "../../handlers/tasks/DeleteTaskHandler";
import schema from "../../schemas/tasks/delete.json";

const options: RouteOptions = {
    method: 'DELETE',
    url: '/task/:id',
    handler: handler,
    schema: schema
}

const taskHandler: DeleteTaskHandler = new DeleteTaskHandler();

async function handler(request: FastifyRequest, reply: FastifyReply){
    return taskHandler.processRequest(request, reply);
}

export default options;