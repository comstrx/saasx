import type { ManifestInput } from "@engine/spec";

export default {
    owner: "client",
    options: { title: "", language: "", currency: "", theme: "", themes: { light: "", dark: "", system: "" }, saved: "" },
} satisfies ManifestInput;
