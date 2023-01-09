import {IGroupCreateOptions, IGroupStorage} from "../types/GroupTypes";
import {FastifyRequest} from "fastify";
import {GroupsService} from "../services/GroupsService";

export class GroupsController {

    static create(request: FastifyRequest) {
        const group = request.body as IGroupCreateOptions;

        return GroupsService.upsert(group);
    }

    static get(request: FastifyRequest) {
        const {id} = request.params;

        if(id){
            return GroupsService.get(id);
        }else{
            return GroupsService.getAll();
        }
    }

    static update(request: FastifyRequest) {
        const {id} = request.params;
        const group = request.body as IGroupCreateOptions;

        return GroupsService.upsert(group, id);
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params;

        return GroupsService.delete(id);
    }
}