import { bench, do_not_optimize, run } from "engine/tooling";
import { fieldFacts, parse, z } from "engine/validate";

const row = z.object({
    id: z.number().int().positive(),
    name: z.string().min(2).max(80),
    price: z.string().regex(/^-?\d+(?:\.\d{1,6})?$/),
    tags: z.array(z.string()).max(10),
    address: z.object({ city: z.string(), zip: z.string().optional() }).optional(),
});
const rows = z.array(row);
const data = Array.from({ length: 1000 }, ( _, i ) => ({
    id: i + 1,
    name: `Item ${i}`,
    price: "12.50",
    tags: ["a", "b"],
    address: { city: "Cairo" },
}));
const bad = { id: -1, name: "x", price: "no", tags: [], extra: true };

bench("parse 1000 rows", () => do_not_optimize(parse(rows, data)));
bench("parse one row", () => do_not_optimize(parse(row, data[0])));
bench("refuse a bad row into keyed rules", () => do_not_optimize(parse(row, bad)));
bench("fieldFacts", () => do_not_optimize(fieldFacts(row)));

await run();
