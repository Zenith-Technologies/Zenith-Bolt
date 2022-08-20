export type MonitorResponse = FlipStateData | TimestampData;

export interface MonitorCallback {
    (data: FlipStateData | TimestampData): void
}

interface FlipStateData {
    type: "follow",
    id: string,
    info: {
        contract: string,
        caller: string,
        calldata: string
    }
}

interface TimestampData {
    type: "timestamp",
    id: string,
    info: {
        timestamp: number,
        blocksSinceTimestamp: number
    }
}