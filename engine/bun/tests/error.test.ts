import { describe, expect, test } from "bun:test";
import {
    Failure,
    describe as facts,
    failureOf,
    formErrors,
    guarded,
    reference,
    settled,
    transient,
    unreachable,
} from "engine/error";

describe("failure", () => {

    test("a kind carries its status unless a real HTTP status is given", () => {

        expect(new Failure("timeout").status).toBe(504);
        expect(new Failure("http", { status: 422 }).status).toBe(422);
        expect(new Failure("http", { status: 99 }).status).toBe(502);

    });
    test("transient and settled answer the retry question", () => {

        expect(transient(new Failure("network"))).toBe(true);
        expect(transient(new Failure("http", { status: 429 }))).toBe(true);
        expect(transient(new Failure("http", { status: 404 }))).toBe(false);
        expect(settled(new Failure("missing"))).toBe(true);

    });
    test("an unreachable backend is a network or timeout failure, never an answer it gave", () => {

        expect(unreachable(new Failure("network"))).toBe(true);
        expect(unreachable(new Failure("timeout"))).toBe(true);
        expect(unreachable(new Failure("http", { status: 503 }))).toBe(false);
        expect(unreachable(new Error("network"))).toBe(false);

    });
    test("guarded wraps strangers and keeps failures", () => {

        expect(() => guarded(() => JSON.parse("{"))).toThrow(Failure);

        const own = new Failure("denied");

        expect(() =>
            guarded(() => {

                throw own;

            }),
        ).toThrow(own);

    });
    test("facts describe the cause chain and the reference quotes the request id", () => {

        const failure = new Failure("http", { status: 500, requestId: "abc-123-def", cause: new Error("boom") });

        expect(facts(failure).cause).toEqual({ name: "Error", message: "boom" });
        expect(reference(failure)).toBe("REQ-ABC123DE");
        expect(failureOf("x").kind).toBe("unknown");

    });

});
describe("form errors", () => {

    test("field errors map one message per field, else one form message, else the fallback", () => {

        expect(formErrors(new Failure("input", { errors: { email: ["taken", "x"], password: [] } }), "no")).toEqual({
            email: "taken",
            password: "no",
        });
        expect(formErrors(new Failure("denied", { message: "sign in" }), "no")).toEqual({ _form: "sign in" });
        expect(formErrors(new Error("boom"), "no")).toEqual({ _form: "no" });

    });

});
