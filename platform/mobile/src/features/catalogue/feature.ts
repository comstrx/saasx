import type { ManifestInput } from "engine/spec";

export default {
    owner: "client",
    options: { title: "", empty: "", from: "", columns: 2, loading: "", failed: "", offline: "", cached: "" },
    ports: { items: { kind: "list", fields: ["name"] } },
} satisfies ManifestInput;
