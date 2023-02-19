import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {GroupsController} from "../controllers/GroupsController";
import {RPCController} from "../controllers/RPCController";
import {WalletsService} from "../services/WalletsService";
import {WalletsController} from "../controllers/WalletsController";
import groupSchemas from "../schemas/groups.schema";
import rpcSchemas from "../schemas/rpcs.schema";
import walletsSchema from "../schemas/wallets.schema";

// Registers all routes
export class RouteRegister {
    private fastify: FastifyInstance

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    public initializeRoutes(): FastifyInstance {
        this.registerGroups();
        this.registerWallets();
        /*this.registerTasks();
        this.registerSettings();
        this.registerProxies();*/
        this.registerRPCs();

        return this.fastify;
    }

    public registerGroups(){
        this.fastify.get("/groups", {
            schema: groupSchemas.GET_GROUPS
        }, (req: FastifyRequest, reply: FastifyReply) => {
            return GroupsController.get(req);
        });

        this.fastify.get("/groups/:id", {
            schema: groupSchemas.GET_GROUP_BY_ID
        }, (req, reply) => {
            return GroupsController.get(req);
        });

        this.fastify.post("/groups", {
            schema: groupSchemas.CREATE_GROUP
        }, (req, reply) => {
            return GroupsController.create(req);
        });

        this.fastify.put("/groups/:id", {
            schema: groupSchemas.UPDATE_GROUP
        }, (req, reply) => {
            return GroupsController.update(req);
        });
        
        this.fastify.delete("/groups/:id", {
            schema: groupSchemas.DELETE_GROUP
        }, (req, reply) => {
            return GroupsController.delete(req);
        })
    }

    public registerWallets(){
        this.fastify.get("/wallets", {
            schema: walletsSchema.GET_WALLET_GROUPS
        }, (req, reply) => {
            return WalletsController.get(req);
        })

        this.fastify.get("/wallets/:id", {
            schema: walletsSchema.GET_WALLET_GROUP_BY_ID
        }, (req, reply) => {
            return WalletsController.get(req);
        })

        this.fastify.post("/wallets", {
            schema: walletsSchema.CREATE_WALLET_GROUP
        }, (req, reply) => {
            return WalletsController.create(req);
        })

        this.fastify.put("/wallets/:id", {
            schema: walletsSchema.UPDATE_WALLET_GROUP
        }, (req, reply) => {
            return WalletsController.update(req);
        });

        this.fastify.delete("/wallets/:id", {
            schema: walletsSchema.DELETE_WALLET_GROUP
        }, (req, reply) => {
            return WalletsController.delete(req);
        })

        this.fastify.post("/wallets/:groupId/wallet", {
            schema: walletsSchema.ADD_WALLET_TO_WALLET_GROUP
        }, (req, reply) => {
            return WalletsController.addWalletToGroup(req);
        })

        this.fastify.delete("/wallets/:groupId/wallet/:walletId", {
            schema: walletsSchema.DELETE_WALLET_FROM_WALLET_GROUP
        }, (req, reply) => {
            return WalletsController.deleteWalletFromGroup(req);
        })
    }

    public registerRPCs(){
        this.fastify.get("/rpcs", {
            schema: rpcSchemas.GET_RPCS
        }, (req: FastifyRequest, reply: FastifyReply) => {
            return RPCController.get(req);
        });

        this.fastify.get("/rpcs/:id", {
            schema: rpcSchemas.GET_RPC_BY_ID
        }, (req, reply) => {
            return RPCController.get(req);
        });

        this.fastify.post("/rpcs", {
            schema: rpcSchemas.CREATE_RPC
        }, (req, reply) => {
            return RPCController.create(req);
        });

        this.fastify.put("/rpcs/:id", {
            schema: rpcSchemas.UPDATE_RPC
        }, (req, reply) => {
            return RPCController.update(req);
        });

        this.fastify.delete("/rpcs/:id", {
            schema: rpcSchemas.DELETE_RPC
        }, (req, reply) => {
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