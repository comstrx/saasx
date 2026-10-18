import { describe, expect, test } from "bun:test";
import { hostConfig } from "../tools/compile/host.ts";

const window = { width: 1200, height: 760, minWidth: 720, minHeight: 480, resizable: true, decorations: true };
const input = { identity: "client", name: "App", app: { slug: "app", identifier: "app.desk.client" }, window, permissions: [] };

describe("host config", () => {

    test("the product is the spec, the window carries the content name and the spec's sizes", () => {

        const host = hostConfig(input);

        expect(host.productName).toBe("client");
        expect(host.identifier).toBe("app.desk.client");
        expect(host.app.windows).toEqual([{ label: "main", title: "App", ...window }]);

    });
    test("the capability grants core:default once, plus the spec's permissions, deduplicated and sorted, on the main window only", () => {

        const host = hostConfig({ ...input, permissions: ["dialog:allow-open", "core:default", "dialog:allow-open", "clipboard:allow-read"] });
        const [capability] = host.app.security.capabilities;

        expect(host.app.security.capabilities).toHaveLength(1);
        expect(capability?.identifier).toBe("app");
        expect(capability?.windows).toEqual(["main"]);
        expect(capability?.permissions).toEqual(["clipboard:allow-read", "core:default", "dialog:allow-open"]);

    });
    test("a spec that declares nothing gets exactly the core defaults", () => {

        expect(hostConfig(input).app.security.capabilities[0]?.permissions).toEqual(["core:default"]);

    });

});
