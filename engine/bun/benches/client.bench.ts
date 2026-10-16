import { applyPatch, createForm } from "engine/client";
import { bench, do_not_optimize, run } from "engine/tooling";
import type { FieldFact } from "engine/validate";

const rows = Array.from({ length: 500 }, ( _, i ) => ({ id: i, name: `Row ${i}`, updated_at: "2026-10-13T00:00:00+00:00" }));
const patch = { path: "catalog", key: "id", version: "updated_at" };
const payload = { catalog: { id: 250, name: "Changed", updated_at: "2026-10-14T00:00:00+00:00" } };
const fields: FieldFact[] = [
    { name: "name", kind: "text", required: true, nullable: false },
    { name: "stock", kind: "integer", required: false, nullable: false },
    { name: "address.city", kind: "text", required: false, nullable: false },
];
const form = createForm({ fields, locales: ["en"], submit: async ( values ) => values });

form.getState().load({ name: "Walk", stock: 3, address: { city: "Cairo" } });

bench("applyPatch into 500 rows", () => do_not_optimize(applyPatch(rows, true, "catalog.saved", payload, patch)));
bench("form.set", () => form.getState().set("name", "Walk Hotel"));
bench("form.submit (nested)", async () => do_not_optimize(await form.getState().submit()));

await run();
