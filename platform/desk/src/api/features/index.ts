import { document, type Endpoint } from "engine/api";

export const endpoints = {
    site: document("content"),
} as const;

type Entity = { parameter: string; list?: string };

export const entities = {} as const satisfies Record<string, Entity>;

export type Endpoints = typeof endpoints;
export type Feature = keyof Endpoints & string;
export type OperationOf<F extends Feature> = keyof Endpoints[F] & string;
export type EndpointOf<F extends Feature, O extends OperationOf<F>> = Endpoints[F][O] extends Endpoint ? Endpoints[F][O] : never;
export type EntityKind = keyof typeof entities & string;
