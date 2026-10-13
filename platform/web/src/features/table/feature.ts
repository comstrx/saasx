import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: {
        title: "", empty: "", loading: "", failed: "", offline: "", cached: "",
        select: false, key: "id", columns: [], sorts: [], paging: false,
        labels: { sort: "", page: "", previous: "", next: "" },
    },
    ports: { rows: { kind: "list" } },
    signals: ["selected", "sort", "page"],
} satisfies ManifestInput;
