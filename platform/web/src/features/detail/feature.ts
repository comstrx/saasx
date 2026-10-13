import type { ManifestInput } from "@engine/spec";

export default {
    owner: "server",
    options: { from: "", missing: "", back: "" },
    ports: { item: { kind: "one", fields: ["name"] } },
} satisfies ManifestInput;
