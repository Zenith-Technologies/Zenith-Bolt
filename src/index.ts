import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
import {HttpServer} from "./bin/HttpServer";
import * as http from "http";

async function startServices(){
    console.log("Starting services...");
    const httpServer = new HttpServer();
    await httpServer.registerPlugins();
    const routeRegister = new RouteRegister(httpServer.getServer());
    routeRegister.initializeRoutes();
    await httpServer.postRouteRegistration();

    httpServer.start();
}

startServices();