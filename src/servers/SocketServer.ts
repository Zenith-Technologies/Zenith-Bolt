import {WebSocket, WebSocketServer} from "ws";
import {IStatus} from "../definitions/tasks/TaskTypes";

export interface UpdateMessage {
    group: number,
    task: string,
    oldStatus: IStatus,
    newStatus: IStatus
}

class SocketServer {
    private server: WebSocketServer;

    constructor() {
        this.server = new WebSocketServer({
            port: 5837
        });
        console.log("WS listening on port 5837")
    }

    emitUpdate(update: UpdateMessage): void {
        this.server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(update));
            }
        })
    }
}

const socketServer = new SocketServer();

export default socketServer;