import type { ManifestInput } from "engine/spec";

export default {
    owner: "client",
    options: { title: "", detail: "", enable: "", saved: "", queued: "", failed: "", denied: "", unsupported: "", errors: {} },
    ports: { save: { kind: "write" } },
} satisfies ManifestInput;
