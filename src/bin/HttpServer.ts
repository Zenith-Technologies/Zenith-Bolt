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

        // Sets up zod to be used for compiling/validating
        app.setValidatorCompiler(validatorCompiler);
        app.setSerializerCompiler(serializerCompiler);

        // Uses zod to set up types
        await app.withTypeProvider<ZodTypeProvider>();

        // Settings for setting up swagger
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

        // Settings for swagger UI (route serving)
        const swaggerUiOptions: FastifySwaggerUiOptions = {
            routePrefix: "/documentation",
            uiConfig: {
                docExpansion: "full",
                deepLinking: false,
            },
            staticCSP: true,
        }

        // Register plugins
        await app.register(fastifySwagger, swaggerOptions);
        await app.register(fastifySwaggerUi, swaggerUiOptions)

        // Hook that changes status code if a {success: false} is found
        app.addHook("preSerialization", (request, reply, payload, done) => {
            if(payload == null){
                done();
                return;
            }

            if(typeof payload === "object") {
                if ("success" in payload) {
                    if(payload.success === false){
                        reply.status(500);
                    }
                }
            }
            done();
        })

        this.server = app;
    }

    async postRouteRegistration(){
        // Wait for server to load all routes, then create the swagger config to serve
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