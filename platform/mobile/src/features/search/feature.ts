import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { placeholder: "", go: "", mode: "signal" },
    signals: ["search"],
} satisfies ManifestInput;
