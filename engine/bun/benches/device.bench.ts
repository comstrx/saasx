import { createDevice, webAdapter } from "engine/device";
import { bench, do_not_optimize, run } from "engine/tooling";

const device = createDevice(webAdapter({ navigator: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/142.0", language: "en" } }));

bench("device.info", () => do_not_optimize(device.info()));

await run();
