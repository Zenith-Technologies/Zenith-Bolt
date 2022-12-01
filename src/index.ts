import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
import walletsManager from "./managers/WalletsManager";
import groupsManager from "./managers/GroupsManager";
import settingsManager, {IRPCOptions} from "./managers/SettingsManager";
import {nanoid} from "nanoid";
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

const settings = settingsManager.fetchSettings();

/*const newRpc: IRPCOptions = {
    name: "Test RPC",
    url: "https://api.zmok.io/testnet/kivfhmgzvbouyczj",
    type: "http"
}

settings.rpcs[nanoid(6)] = newRpc;

settingsManager.updateSettings(settings);*/

console.log(settingsManager.fetchSettings());