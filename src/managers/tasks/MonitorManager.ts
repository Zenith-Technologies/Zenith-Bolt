interface IMonitorCallbacks {
    [key: string]: MonitorCallback[]
}

interface MonitorCallback {
    (id: number, stage: "confirmed" | "pending", time: number): void;
}

class MonitorManager {
    private ws: WebSocket;
    private callbacks: IMonitorCallbacks;

    constructor() {
        this.ws = new WebSocket("ws://localhost:2947");
        this.callbacks = {};
    }
}