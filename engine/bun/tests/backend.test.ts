import { describe, expect, test } from "bun:test";
import { backendOf, transportIssues } from "engine/spec";

describe("backend plan", () => {

    test("a backend plan derives addresses from the urls and keeps surface options on the connection", () => {

        const plan = backendOf(
            "site",
            {
                urls: { production: "https://a.test", local: "http://l.test", browser: null },
                options: { prefix: "v1", sessionCookie: "s", proxies: 1, timeoutMs: 5 },
                request: undefined,
                response: undefined,
            },
            "USD",
        );

        expect(plan.api.context).toEqual({
            spec: "site",
            sessionCookie: "s",
            proxies: 1,
            tenant: null,
            currency: "USD",
        });
        expect(plan.api.connections.primary).toMatchObject({
            baseUrl: "https://a.test/v1",
            browserBaseUrl: null,
            timeoutMs: 5,
        });
        expect(plan.development).toEqual({ baseUrl: "http://l.test/v1", browserBaseUrl: null });
        expect(
            backendOf("app", { urls: { production: null, local: null }, options: { prefix: "" } }, "USD").api
                .connections.primary,
        ).toEqual({ baseUrl: null, development: { baseUrl: null, browserBaseUrl: null } });

    });

});
describe("insecure transports", () => {

    const plain = { urls: { production: "http://a.test", local: "http://l.test" }, options: { prefix: "" } };

    test("a cleartext production or realtime address is refused unless the contracts say insecure", () => {

        expect(transportIssues(plain).join("\n")).toContain("insecure");
        expect(transportIssues({ ...plain, options: { prefix: "", insecure: true } })).toEqual([]);
        expect(transportIssues({ ...plain, urls: { production: "https://a.test", local: "http://l.test" } })).toEqual(
            [],
        );
        expect(transportIssues({ ...plain, urls: { production: null, local: null } })).toEqual([]);
        expect(
            transportIssues({
                urls: { production: "https://a.test", local: null },
                realtime: { url: "ws://r.test", key: "k", protocol: "pusher" },
                options: { prefix: "" },
            }).join("\n"),
        ).toContain("realtime");
        expect(
            transportIssues({
                urls: { production: "https://a.test", local: null },
                realtime: { url: "wss://r.test", key: "k", protocol: "pusher" },
                options: { prefix: "" },
            }),
        ).toEqual([]);

    });
    test("an asset origin is held to the same rule as the backend", () => {

        const secure = { urls: { production: "https://a.test", local: null }, options: { prefix: "" } };

        expect(transportIssues({ ...secure, assets: "http://cdn.test" }).join("\n")).toContain("contracts.assets");
        expect(transportIssues({ ...secure, assets: "https://cdn.test" })).toEqual([]);
        expect(transportIssues({ ...secure, assets: "http://cdn.test", options: { prefix: "", insecure: true } })).toEqual([]);

    });
    test("the backend plan carries insecure apart from the connection", () => {

        const plan = backendOf("app", { ...plain, options: { prefix: "", insecure: true } }, "USD");

        expect(plan.insecure).toBe(true);
        expect(plan.api.connections.primary).not.toHaveProperty("insecure");
        expect(backendOf("app", plain, "USD").insecure).toBe(false);

    });

});
