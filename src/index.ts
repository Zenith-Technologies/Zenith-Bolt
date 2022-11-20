import * as dotenv from 'dotenv';
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
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

const Store = require('electron-store');

const store = new Store();

store.set('unicorn', '🦄');
console.log(store.get('unicorn'));
//=> '🦄'

// Use dot-notation to access nested properties
store.set('foo.bar', true);
console.log(store.get('foo'));
//=> {bar: true}

store.delete('unicorn');
console.log(store.get('unicorn'));