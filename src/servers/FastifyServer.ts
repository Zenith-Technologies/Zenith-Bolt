import {RouteRegister} from "../routes/RouteRegister";
import fastify from "fastify";

export class FastifyServer {

    startServer(){
        const server = fastify();

        (new RouteRegister(server)).registerRoutes().then(() => {
            server.listen({ port: 8080 }, (err, address) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
                console.log(`Server listening at ${address}`)
            })
        });
    }
}