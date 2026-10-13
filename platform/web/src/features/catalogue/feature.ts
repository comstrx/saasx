import type { ManifestInput } from "@engine/spec";

export default {
    owner: "server",
    options: { title: "", empty: "", from: "", columns: 3 },
    ports: { items: { kind: "list", fields: ["name"] } },
} satisfies ManifestInput;
