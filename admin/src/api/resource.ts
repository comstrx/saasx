import { z } from "zod";
import type { ApiEntry, ApiMethod } from "@/api/client";

const prefix = "";

const list    = "list";
const show    = "show";
const create  = "store";
const update  = "update";
const destroy = "destroy";

const methods = {
    read:    "GET",
    create:  "POST",
    update:  "PATCH",
    destroy: "DELETE",
} satisfies Record<string, ApiMethod>;

type ResourceExtras = Record<string, ApiEntry>;

type ResourceConfig<T, E extends ResourceExtras> = {
    schema?: z.ZodType<T>;
    extra?: E;
};
export function resource <T = unknown, E extends ResourceExtras = Record<string, never>> ( name: string, config: ResourceConfig<T, E> = {} ) {

    const collection = `${prefix}/${name}`;
    const member = `${prefix}/${name}/:id`;

    const { schema, extra } = config;

    return {

        [list]: { resource: name, action: list, method: methods.read, path: collection, need: `${name}.${list}`, schema: schema && z.array(schema) },
        [show]: { resource: name, action: show, method: methods.read, path: member, need: `${name}.${show}`, schema },
        [create]: { resource: name, action: create, method: methods.create, path: collection, need: `${name}.${create}`, schema },
        [update]: { resource: name, action: update, method: methods.update, path: member, need: `${name}.${update}`, schema },
        [destroy]: { resource: name, action: destroy, method: methods.destroy, path: member, need: `${name}.${destroy}` },

        ...(extra ?? ({} as E)),

    } as const;

}
