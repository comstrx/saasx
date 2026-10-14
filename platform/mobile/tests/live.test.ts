import { describe, expect, test } from "bun:test";
import { browserConfig, createApi, requestContext } from "@engine/api";
import { prepareSpec } from "@engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { loadSpec, specFromEnvironment } from "../tools/core/index.ts";

const spec = await loadSpec(specFromEnvironment());
const { config } = prepareSpec(spec, new Map(), "production");
const client = config.api ? browserConfig(config.api, config.contract) : null;
const base = client?.api.connections.primary?.baseUrl ?? null;
const alive = base ? await fetch(`${base}/ready`).then(() => true, () => false) : false;
const live = alive ? test : test.skip;

describe("the app's compiled client against the backend behind the spec", () => {

    live("reads the catalogue through the client projection with the declared tenant", async () => {

        if ( !client ) return;

        const api = createApi(endpoints, client.api, client.contract, () => requestContext(client.api.context, { language: "ar", requestId: "app-live-1" }), { execution: "client" });
        const result = await api.catalogs.list({ limit: 2, search: "hotel" });

        expect(result.resource.length).toBe(2);
        expect(result.resource.every(( row ) => row.type === "hotel")).toBe(true);
        expect(result.meta.pagination?.limit).toBe(2);

    });

});
