import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { title: "", detail: "", enable: "", saved: "", failed: "", denied: "", unsupported: "" },
    ports: { save: { kind: "write" } },
} satisfies ManifestInput;
