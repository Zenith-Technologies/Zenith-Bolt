import * as dotenv from 'dotenv';
import Conf from "conf";
dotenv.config()

import fastify from 'fastify';
import {RouteRegister} from "./routes/RouteRegister";
import walletsManager from "./managers/WalletsManager";
import groupsManager from "./managers/GroupsManager";
import {nanoid} from "nanoid";
import {Monitor} from "./tasks/monitor/Monitor";
import {ITaskOptions} from "./definitions/tasks/TaskTypes";
import rpcManager from "./managers/RPCManager";
import taskManager from "./tasks/managers/TaskProcessManager";
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
        const walletGroup = walletsManager.createWalletGroup({
            name: "wallet group 1",
            wallets: [{
                privateKey: "a9d51978771e1bf4a2528290763939ca3221d78217174485174631cc04278cb8"
            }]
        });

        if(walletGroup){
            console.log("created wallet group", walletGroup.id)
            const taskGroup = groupsManager.createGroup({
                name: "task group 1",
                type: "mint",
                target: "0x1665C40F357b6679eBDf7D36038980e6783A6BE7"
            })

            if(taskGroup){
                console.log("created task group", taskGroup.id);

                const rpc = rpcManager.addRPC({
                    name: "rpc 1",
                    url: "https://sepolia.infura.io/v3/6365c9b6ee404572ac22977cb2442ced"
                })

                if(rpc){
                    console.log("created rpc", rpc.id);

                    const task: ITaskOptions = {
                        account: walletGroup.wallets[0].id,
                        group: taskGroup.id,
                        taskSettings: {
                            type: "mint",
                            data: "0xa0712d680000000000000000000000000000000000000000000000000000000000000001",
                            price: 0,
                            monitorSettings: {
                                timestamp: 1673058360,
                                mode: "timestamp"
                            }
                        },
                        transactionSettings: {
                            nodes: [rpc.id],
                            gas: {
                                mode: "provided",
                                maxFeePerGas: 2,
                                priorityFee: 1
                            },
                            autoGas: false
                        }
                    }

                    const createdTask = taskManager.createTask(task);

                    taskManager.startTask(createdTask);
                }
            }
        }
    })
    .on("error", (error: Error) => {
        console.error(error);
    })