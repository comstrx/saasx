import type { ManifestInput } from "engine/spec";

export default {
    owner: "client",
    options: { from: "", missing: "", back: "", pick: "", loading: "", failed: "", offline: "", cached: "", edit: "", editLabel: "", remove: "", restore: "", removed: "", restored: "", denied: "", labels: {}, errors: {} },
    ports: { item: { kind: "one" }, remove: { kind: "write", required: false }, restore: { kind: "write", required: false } },
} satisfies ManifestInput;
