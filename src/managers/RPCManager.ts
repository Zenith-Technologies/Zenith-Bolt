export interface IRPCOptions {
    default?: boolean,
    name: string,
    url: string
    type: "http" | "ws"
}

interface IRPC {
    id: string,
    default: boolean,
    name: string,
    url: string
    type: "http" | "ws"
}