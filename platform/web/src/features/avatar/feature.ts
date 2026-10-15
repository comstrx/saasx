import type { ManifestInput } from "engine/spec";

export default {
    owner: "client",
    options: { title: "", pick: "", camera: "", saved: "", failed: "", loading: "", offline: "", cached: "", empty: "", errors: {} },
    ports: { me: { kind: "one", fields: ["image"] }, save: { kind: "write" } },
} satisfies ManifestInput;
