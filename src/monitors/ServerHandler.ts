import {fastify, FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import EventEmitter from "events";
import schema from "../schema/webhook.json";
import {MonitorResponse} from "../types/monitor/MonitorResponse";

export class ServerHandler extends EventEmitter{
    server: FastifyInstance;

    constructor() {
        super();

        this.server = fastify();

        this.registerWebhook();
    }

    private registerWebhook(){
        this.server.route({
            method: "POST",
            url: "/webhook",
            handler: this.handleWebhook,
            schema: schema
        })
    }

    private handleWebhook(request: FastifyRequest, reply: FastifyReply){
        const data = request.body as MonitorResponse;

        this.emit("response", data);

        reply.status(200).send('OK');
    }
}