import { describe, expect, test } from "bun:test";
import { serverOf } from "../tools/serve/index.ts";

describe("standalone server", () => {

    test("the served entry is the app's own server, never one a traced package ships", () => {

        expect(serverOf(["node_modules/next/dist/server.js", "platform/web/server.js"])).toBe("platform/web/server.js");
        expect(serverOf(["server.js", "node_modules/x/server.js"])).toBe("server.js");
        expect(serverOf(["node_modules/next/server.js"])).toBeUndefined();

    });

});
