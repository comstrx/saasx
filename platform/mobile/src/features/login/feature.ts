import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { title: "", email: "", password: "", continue: "", otp: "", verify: "", sent: "", back: "", failed: "" },
    ports: { login: { kind: "write" }, verify: { kind: "write" } },
} satisfies ManifestInput;
