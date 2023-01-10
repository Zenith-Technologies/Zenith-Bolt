import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {GroupsController} from "../controllers/GroupsController";
import {RPCController} from "../controllers/RPCController";
import {WalletsService} from "../services/WalletsService";
import {WalletsController} from "../controllers/WalletsController";

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
        this.fastify.get("/wallets", {}, (req, reply) => {
            return WalletsController.get(req);
        })

        this.fastify.get("/wallets/:id", {}, (req, reply) => {
            return WalletsController.get(req);
        })

        this.fastify.post("/wallets", {}, (req, reply) => {
            return WalletsController.create(req);
        })

        this.fastify.put("/wallets/:id", {}, (req, reply) => {
            return WalletsController.update(req);
        });

        this.fastify.delete("/wallets/:id", {}, (req, reply) => {
            return WalletsController.delete(req);
        })

        this.fastify.post("/wallets/:groupId/wallet", {}, (req, reply) => {
            return WalletsController.addWalletToGroup(req);
        })

        this.fastify.delete("/wallets/:groupId/wallet/:walletId", {}, (req, reply) => {
            return WalletsController.deleteWalletFromGroup(req);
        })
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