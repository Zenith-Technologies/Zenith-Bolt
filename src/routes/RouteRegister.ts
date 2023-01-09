import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {GroupsController} from "../controllers/GroupsController";
import {RPCController} from "../controllers/RPCController";

export class RouteRegister {
    private fastify: FastifyInstance

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    public registerGroups(){
        this.fastify.get("/groups", {}, (req: FastifyRequest, reply: FastifyReply) => {
            return GroupsController.get(req);
        });

        this.fastify.get("/groups/:id", {}, (req, reply) => {
            return GroupsController.get(req);
        });

        this.fastify.post("/groups", {}, (req, reply) => {
            return GroupsController.create(req);
        });

        this.fastify.put("/groups/:id", {}, (req, reply) => {
            return GroupsController.update(req);
        });
        
        this.fastify.delete("/groups/:id", {}, (req, reply) => {
            return GroupsController.delete(req);
        })
    }

    public registerWallets(){

    }

    public registerRPCs(){
        this.fastify.get("/rpcs", {}, (req: FastifyRequest, reply: FastifyReply) => {
            return RPCController.get(req);
        });

        this.fastify.get("/rpcs/:id", {}, (req, reply) => {
            return RPCController.get(req);
        });

        this.fastify.post("/rpcs", {}, (req, reply) => {
            return RPCController.create(req);
        });

        this.fastify.put("/rpcs/:id", {}, (req, reply) => {
            return RPCController.update(req);
        });

        this.fastify.delete("/rpcs/:id", {}, (req, reply) => {
            return RPCController.delete(req);
        })
    }

    public registerSettings(){

    }

    public registerProxies(){

    }

    public registerTasks(){

    }
}