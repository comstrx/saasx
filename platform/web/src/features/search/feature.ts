import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { placeholder: "", go: "", mode: "query" },
    signals: ["search"],
} satisfies ManifestInput;
