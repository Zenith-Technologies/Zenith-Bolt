import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
import walletsManager from "./managers/WalletsManager";
import groupsManager from "./managers/GroupsManager";
import {nanoid} from "nanoid";
import {Monitor} from "./managers/monitors/Monitor";
const server = fastify();

/*console.log('Starting server...');
(new RouteRegister(server)).registerRoutes().then(() => {
    server.listen({ port: 8080 }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    })
});*/

console.log("Starting monitor...");
(new Monitor())
    .on("ready", () => {
        Monitor.block.on("block", (block) => {
            console.log(block);
        })
    })
    .on("error", (error: Error) => {
        console.error(error);
    })