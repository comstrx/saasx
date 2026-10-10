import { useSyncExternalStore } from "react";
import { AppState } from "react-native";

const subscribe = ( changed: () => void ) => {

    const watcher = AppState.addEventListener("change", changed);
    return () => watcher.remove();

};
const snapshot = () => AppState.currentState === "active";

export const useForeground = () => useSyncExternalStore(subscribe, snapshot, () => true);
