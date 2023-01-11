import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";

console.log('Starting server...');
const server = (new RouteRegister(fastify())).initializeRoutes();
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
});
console.log("Starting monitor...");