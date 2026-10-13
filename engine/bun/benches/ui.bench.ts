import { createDevice, webAdapter } from "@engine/device";
import { cssVariables, defineTokens } from "@engine/ui";
import { bench, do_not_optimize, run } from "mitata";

const tokens = defineTokens({
    colors: { light: { ink: "#111", body: "#fff" }, dark: { ink: "#eee", body: "#000" } },
    space: { 0: 0, 1: 4, 2: 8, 4: 16 },
    radius: { sm: 6, md: 12 },
    type: { md: { size: 16, line: 24, weight: 400 } },
});
const device = createDevice(
    webAdapter({ navigator: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/142.0", language: "en" } }),
);

bench("cssVariables", () => do_not_optimize(cssVariables(tokens, "light", ":root")));
bench("device.info", () => do_not_optimize(device.info()));

await run();
