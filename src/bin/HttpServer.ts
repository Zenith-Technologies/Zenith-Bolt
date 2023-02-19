// spins up the fastify instance
import fastify, {FastifyInstance} from "fastify";
import fastifySwagger, {SwaggerOptions} from "@fastify/swagger";
import fastifySwaggerUi, {FastifySwaggerUiOptions} from "@fastify/swagger-ui";
import Constants from "../helpers/constants";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';

export class HttpServer {
    private server: FastifyInstance;

    constructor() {
        this.server = fastify();
    }

    async registerPlugins(){
        const app = this.server;

        app.setValidatorCompiler(validatorCompiler);
        app.setSerializerCompiler(serializerCompiler);

        await app.withTypeProvider<ZodTypeProvider>();

        const swaggerOptions: SwaggerOptions = {
            openapi: {
                info: {
                    title: "Zenith-Bolt documentation",
                    description: "Documentation for the underlying routes supporting Zenith-Bolt",
                    version: Constants.VERSION,
                }
            },
            transform: jsonSchemaTransform
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
        //require('fs').writeFileSync("./swagger.yml", this.server.swagger({yaml: true}));
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