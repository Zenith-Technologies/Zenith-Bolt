import {IGroupCreateOptions, IGroupStorage} from "../types/GroupTypes";
import {FastifyRequest} from "fastify";
import {GroupsService} from "../services/GroupsService";
import {IDParam} from "../types/QueryParamTypes";
import {APIResponse} from "../types/ResponseTypes";
import {wrap} from "../helpers/APIResponseWrapper";

export class GroupsController {

    static create(request: FastifyRequest): APIResponse {
        const group = request.body as IGroupCreateOptions;

        return wrap(() => {
            return {
                success: true,
                error: null,
                data: GroupsService.upsert(group)
            };
        })();
    }

    static get(request: FastifyRequest): APIResponse {
        const {id} = request.params as IDParam;
        return wrap((id: string) => {
            if (id) {
                const group = GroupsService.get(id);
                return {
                    success: true,
                    error: null,
                    data: group
                }
            } else {
                const groups = GroupsService.getAll();
                return {
                    success: true,
                    error: null,
                    data: groups
                }
            }
        })(id);
    }

    static update(request: FastifyRequest) {
        const {id} = request.params as IDParam;
        const group = request.body as IGroupCreateOptions;

        wrap((id, group) => {
            return {
                success: true,
                error: null,
                data: GroupsService.upsert(group, id)
            }
        })(id, group);
    }

    static delete(request: FastifyRequest) {
        const {id} = request.params as IDParam;

        wrap((id) => {
            GroupsService.delete(id);

            return {
                success: true,
                error: null,
                data: {}
            }
        })(id);
    }
}