// spins up the fastify instance
import fastify, {FastifyInstance} from "fastify";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import fastifySwagger, {FastifyDynamicSwaggerOptions, SwaggerOptions} from "@fastify/swagger";
import fastifySwaggerUi, {FastifySwaggerUiOptions} from "@fastify/swagger-ui";
import Constants from "../helpers/constants";

export class HttpServer {
    private server: FastifyInstance;

    constructor() {
        this.server = fastify();
    }

    async registerPlugins(){
        const app = this.server;

        await app.withTypeProvider<TypeBoxTypeProvider>();

        const swaggerOptions: SwaggerOptions = {
            openapi: {
                info: {
                    title: "Zenith-Bolt documentation",
                    description: "Documentation for the underlying routes supporting Zenith-Bolt",
                    version: Constants.VERSION,
                }
            },
        }

        const swaggerUiOptions: FastifySwaggerUiOptions = {
            routePrefix: "/documentation",
            uiConfig: {
                docExpansion: "full",
                deepLinking: false,
            },
            staticCSP: true,
        }

        await app.register(fastifySwagger, swaggerOptions);
        await app.register(fastifySwaggerUi, swaggerUiOptions)

        this.server = app;
    }

    async postRouteRegistration(){
        await this.server.ready();
        this.server.swagger();
    }

    getServer(){
        return this.server;
    }

    start(){
        this.server.listen({
            port: Constants.SERVER_PORT
        }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
        });
    }
}