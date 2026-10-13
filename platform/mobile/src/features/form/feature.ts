import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { title: "", submit: "", saved: "", queued: "", failed: "", loading: "", offline: "", cached: "", empty: "", next: "", labels: {}, choices: {}, errors: {} },
    ports: { item: { kind: "one", required: false }, texts: { kind: "list", required: false }, save: { kind: "write" } },
} satisfies ManifestInput;
