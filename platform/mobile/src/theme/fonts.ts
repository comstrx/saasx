import {
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
} from "@expo-google-fonts/alexandria";
import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

export type FontWeight = "400" | "500" | "600" | "700";
export type Script = "latin" | "arabic";

export const fontAssets = {
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
};

export const families: Record<Script, Record<FontWeight, string>> = {
    latin: {
        "400": "PlusJakartaSans_400Regular",
        "500": "PlusJakartaSans_500Medium",
        "600": "PlusJakartaSans_600SemiBold",
        "700": "PlusJakartaSans_700Bold",
    },
    arabic: {
        "400": "Alexandria_400Regular",
        "500": "Alexandria_500Medium",
        "600": "Alexandria_600SemiBold",
        "700": "Alexandria_700Bold",
    },
};
