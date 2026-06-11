import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { env } from "@/lib/env";
import { request } from "./client";
import type { ApiEntry } from "./resource";

const base = env.NEXT_PUBLIC_API_URL;

const show: ApiEntry<{ id: string }> = {
    resource: "users",
    action: "show",
    method: "GET",
    path: "/users/:id",
    need: "users.view",
    schema: z.object({ id: z.string() }),
};

const list: ApiEntry = {
    resource: "users",
    action: "list",
    method: "GET",
    path: "/users",
    need: "users.view",
};

const bareHealth: ApiEntry<{ status: string }> = {
    resource: "health",
    action: "show",
    method: "GET",
    path: "/health",
    schema: z.object({ status: z.string() }),
    bare: true,
};

const json = ( status: number, payload: unknown, headers?: Record<string, string> ) =>
    new Response(JSON.stringify(payload), { status, headers });

const stubFetch = ( ...responses: (Response | Error)[] ) => {

    const mock = vi.fn();

    for ( const response of responses ) {

        if ( response instanceof Error ) mock.mockRejectedValueOnce(response);
        else mock.mockResolvedValueOnce(response);

    }

    vi.stubGlobal("fetch", mock);

    return mock;

};

afterEach(() => {

    vi.unstubAllGlobals();

});

describe("request", () => {

    it("parses the success envelope and substitutes path params", async () => {

        const mock = stubFetch(json(200, { data: { id: "a b" }, meta: { page: 1 } }));
        const result = await request(show, { params: { id: "a b" } });

        expect(result).toEqual({ data: { id: "a b" }, meta: { page: 1 } });
        expect(mock).toHaveBeenCalledWith(`${base}/users/a%20b`, expect.objectContaining({ method: "GET", credentials: "include" }));

    });

    it("serializes query params and drops undefined values", async () => {

        const mock = stubFetch(json(200, { data: [] }));

        await request(list, { query: { page: 1, q: "term", sort: undefined } });

        expect(mock).toHaveBeenCalledWith(`${base}/users?page=1&q=term`, expect.anything());

    });

    it("throws invalid_response on a schema mismatch", async () => {

        stubFetch(json(200, { data: { id: 7 } }));

        await expect(request(show, { params: { id: "7" } })).rejects.toMatchObject({
            name: "ApiError",
            status: 200,
            code: "invalid_response",
        });

    });

    it("maps 422 failures with field errors", async () => {

        stubFetch(json(422, { error: { code: "validation_failed", message: "invalid", fields: { name: ["required"] } } }));

        await expect(request(list)).rejects.toMatchObject({
            status: 422,
            code: "validation_failed",
            fields: { name: ["required"] },
        });

    });

    it("retries exactly once on 429 honoring Retry-After", async () => {

        const mock = stubFetch(
            json(429, { error: { code: "rate_limited", message: "slow down" } }, { "Retry-After": "0" }),
            json(200, { data: [] }),
        );

        const result = await request(list);

        expect(result.data).toEqual([]);
        expect(mock).toHaveBeenCalledTimes(2);

    });

    it("surfaces the 429 when the retry is limited again", async () => {

        const rateLimited = () => json(429, { error: { code: "rate_limited", message: "slow down" } }, { "Retry-After": "0" });
        const mock = stubFetch(rateLimited(), rateLimited());

        await expect(request(list)).rejects.toMatchObject({ status: 429, code: "rate_limited" });
        expect(mock).toHaveBeenCalledTimes(2);

    });

    it("normalizes network failures", async () => {

        stubFetch(new TypeError("fetch failed"));

        await expect(request(list)).rejects.toMatchObject({ status: 0, code: "network_error" });

    });

    it("validates bare entries against the raw body", async () => {

        stubFetch(json(200, { status: "ok" }));

        const result = await request(bareHealth);

        expect(result).toEqual({ data: { status: "ok" } });

    });

    it("throws invalid_response when a bare body misses the schema", async () => {

        stubFetch(json(200, { data: { status: "ok" } }));

        await expect(request(bareHealth)).rejects.toMatchObject({ code: "invalid_response" });

    });

});
