import type { ManifestInput } from "engine/spec";

export default {
    owner: "client",
    options: { title: "", pick: "", from: "", missing: "", loading: "", failed: "", offline: "", cached: "", edit: "", editLabel: "", remove: "", restore: "", removed: "", restored: "", denied: "", labels: {}, errors: {} },
    ports: { item: { kind: "one" }, remove: { kind: "write", required: false }, restore: { kind: "write", required: false } },
} satisfies ManifestInput;
