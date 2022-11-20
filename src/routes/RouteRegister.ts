import {DoneFuncWithErrOrRes, FastifyInstance, FastifyReply, FastifyRequest, RequestPayload} from "fastify";
import {RecursiveReader} from "../utils/RecursiveReader";
import {join, normalize} from "upath";
import createHttpError from "http-errors";

export class RouteRegister {
    private fastify: FastifyInstance

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    public async registerRoutes(): Promise<void>{
        const routeFiles = (await RecursiveReader.read('./dist/routes')).filter( (file: string) => !file.includes("routes/RouteRegister"));

        // routeFiles.splice(routeFiles.indexOf("src/routes/RouteRegister.ts"), 1);

        for(let route of routeFiles){
            const routeObject = require(join(__dirname, '../../', route)).default;

            routeObject.onSend = (request: FastifyRequest, reply: FastifyReply, payload: RequestPayload, done: DoneFuncWithErrOrRes) => {
                if(reply.getHeader('content-type') !== "application/json; charset=utf-8"){
                    reply.code(503);
                    done(createHttpError(503, 'Invalid response body'));
                }else{
                    done();
                }
            }

            this.fastify.route(routeObject);
        }
        console.log('Routes registered');
    }
}