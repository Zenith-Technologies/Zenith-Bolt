export interface IGroupCreateOptions {
    name: string,
    target: string,
    type: "opensea" | "mint",
}

export interface IGroup extends IGroupCreateOptions {
    id: string
}

export interface IGroupStorage {
    [key: string]: IGroup
}