export interface IProxy extends IProxyOptions{
    id: string,
    lastPing: number
}

export interface IProxyOptions {
    host: string,
    port: number,
    username?: string,
    password?: string,
}

export interface IProxyStorage {
      
}