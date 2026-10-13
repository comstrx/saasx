import { catalogueFacts } from "@engine/spec";
import { bench, featureFacts, run } from "@engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { validateSpec } from "../src/lib/spec/surface.ts";
import { composeMessages, loadSpec, root } from "../tools/core/index.ts";

const [client, admin] = await Promise.all([loadSpec("client"), loadSpec("admin")]);
const facts = await featureFacts(`${root}/src/features`);
const catalogue = catalogueFacts(endpoints);
const sources = { client: await import("../specs/client/config/index.ts"), admin: await import("../specs/admin/config/index.ts") };
const schemas = { client: await import("../specs/client/schema/index.ts"), admin: await import("../specs/admin/schema/index.ts") };
const messages = { client: composeMessages(`${client.folder}/brand/messages`), admin: composeMessages(`${admin.folder}/brand/messages`) };

bench("compile the client spec", () => validateSpec("client", sources.client.default, schemas.client.default, messages.client, facts, catalogue));
bench("compile the admin spec", () => validateSpec("admin", sources.admin.default, schemas.admin.default, messages.admin, facts, catalogue));
bench("compose the client messages", () => composeMessages(`${client.folder}/brand/messages`));

await run();
