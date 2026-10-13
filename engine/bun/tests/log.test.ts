import { describe, expect, test } from "bun:test";
import { createLogger, logLine, memorySink } from "@engine/log";

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
