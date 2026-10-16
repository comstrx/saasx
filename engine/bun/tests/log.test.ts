import { describe, expect, test } from "bun:test";
import { createLogger, lineSink, logLine, memorySink } from "engine/log";

describe("log", () => {

    test("a line drops undefined, redacts secrets and describes errors", () => {

        const line = JSON.parse(
            logLine("warn", "api.failure", {
                token: "x",
                nested: { password: "y" },
                gone: undefined,
                cause: new Error("boom"),
            }),
        ) as Record<string, unknown>;

        expect(line.token).toBe("[redacted]");
        expect((line.nested as Record<string, unknown>).password).toBe("[redacted]");
        expect("gone" in line).toBe(false);
        expect((line.cause as Record<string, unknown>).message).toBe("boom");

    });
    test("a logger honors its level, binds facts and feeds every sink", () => {

        const sink = memorySink();
        const logger = createLogger({ level: "info", sinks: [sink] }).with({ trace: "t1" });

        logger.debug("ignored");
        logger.info("request.done", { ms: 3 });

        expect(sink.entries).toHaveLength(1);
        expect(sink.entries[0]).toMatchObject({ level: "info", event: "request.done", trace: "t1", ms: 3 });

    });

});
describe("edges", () => {

    test("debug stays silent at the info level and bound facts chain through with()", () => {

        const sink = memorySink();
        const logger = createLogger({ level: "info", sinks: [sink] }).with({ spec: "site" }).with({ trace: "t1" });

        logger.debug("quiet");
        logger.warn("loud", { call: "x" });
        expect(sink.entries).toHaveLength(1);
        expect(sink.entries[0]).toMatchObject({ level: "warn", event: "loud", spec: "site", trace: "t1", call: "x" });

    });
    test("redaction reaches nested keys, honors a custom word list, and caps depth", () => {

        const line = logLine("info", "e", {
            headers: { Authorization: "Bearer x", accept: "json" },
            deep: { a: { b: { c: { d: { e: 1 } } } } },
            list: [{ token: "t" }],
        });
        const parsed = JSON.parse(line) as Record<string, unknown>;

        expect(parsed.headers).toEqual({ Authorization: "[redacted]", accept: "json" });
        expect((parsed.list as unknown[])[0]).toEqual({ token: "[redacted]" });
        expect(JSON.stringify(parsed.deep)).toContain("{…}");
        expect(JSON.parse(logLine("info", "e", { mine: 1, other: 2 }, ["mine"]))).toMatchObject({ mine: "[redacted]", other: 2 });

    });
    test("a line sink receives the serialized line only", () => {

        const lines: string[] = [];
        const logger = createLogger({ sinks: [lineSink(( line ) => lines.push(line))] });

        logger.error("boom", { reason: "x" });
        expect(lines).toHaveLength(1);
        expect(JSON.parse(lines[0] as string)).toMatchObject({ level: "error", event: "boom", reason: "x" });

    });

});
