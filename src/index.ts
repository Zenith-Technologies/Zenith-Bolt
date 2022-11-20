import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
const server = fastify();

const config = new Conf();

console.log('Starting server...');
(new RouteRegister(server)).registerRoutes().then(() => {
    server.listen({ port: 8080 }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    })
});