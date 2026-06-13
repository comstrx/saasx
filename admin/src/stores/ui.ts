import { createStore, local, shared } from "@/stores/create-store";

export const useUi = createStore("ui", {
    sidebar: true,
    dialog:  local(null as string | null),
    theme:   shared("system"),
    compact: shared(false),
});
