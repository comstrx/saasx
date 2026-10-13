import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { hello: "", logout: "", loading: "", failed: "", offline: "", cached: "" },
    ports: { me: { kind: "one", fields: ["name"] }, leave: { kind: "write" } },
    access: ["user"],
} satisfies ManifestInput;
