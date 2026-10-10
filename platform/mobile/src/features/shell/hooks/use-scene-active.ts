import { useIsFocused } from "expo-router";
import { useForeground } from "@/elements/hooks/use-foreground";

export function useSceneActive (): boolean {

    const focused = useIsFocused();
    const foreground = useForeground();

    return focused && foreground;

}
