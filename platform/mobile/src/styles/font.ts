import { Platform, type TextStyle } from "react-native";
import { useLocale } from "@/hooks/use-locale";
import { world } from "@/lib/spec/world";

export function useFont (): TextStyle {

    const family = world.fontOf(useLocale()).family;

    return Platform.OS === "android" ? { fontFamily: family, overflow: "visible" } : {};

}
