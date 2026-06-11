import { type ZodType, z } from "zod";

export type Method = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiEntry<T = unknown> = {
    resource: string;
    action: string;
    method: Method;
    path: string;
    need?: string;
    schema?: ZodType<T>;
};

type ExtraConfig = {
    path: string;
    method: Method;
    need?: string;
    schema?: ZodType;
};

type ResourceConfig<T, E extends Record<string, ExtraConfig>> = {
    schema?: ZodType<T>;
    extra?: E;
};

type Crud<T> = {
    list: ApiEntry<T[]>;
    show: ApiEntry<T>;
    create: ApiEntry;
    update: ApiEntry;
    destroy: ApiEntry;
};

export function resource<T = unknown, E extends Record<string, ExtraConfig> = Record<string, never>>(
    name: string,
    cfg: ResourceConfig<T, E> = {},
): Crud<T> & { [K in keyof E]: ApiEntry } {

    const item = cfg.schema;

    const crud: Crud<T> = {
        list: {
            resource: name,
            action: "list",
            method: "GET",
            path: `/${name}`,
            need: `${name}.view`,
            schema: item ? z.array(item) : undefined,
        },
        show: {
            resource: name,
            action: "show",
            method: "GET",
            path: `/${name}/:id`,
            need: `${name}.view`,
            schema: item,
        },
        create: {
            resource: name,
            action: "create",
            method: "POST",
            path: `/${name}`,
            need: `${name}.create`,
        },
        update: {
            resource: name,
            action: "update",
            method: "PATCH",
            path: `/${name}/:id`,
            need: `${name}.update`,
        },
        destroy: {
            resource: name,
            action: "destroy",
            method: "DELETE",
            path: `/${name}/:id`,
            need: `${name}.delete`,
        },
    };

    const extras = Object.fromEntries(
        Object.entries(cfg.extra ?? {}).map(([action, entry]) => [action, { resource: name, action, ...entry }]),
    ) as { [K in keyof E]: ApiEntry };

    return { ...crud, ...extras };

}
