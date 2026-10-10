import Constants from "expo-constants";
import { Platform } from "react-native";

export const nativeMaps = Platform.OS === "ios" || ( Platform.OS === "android" && Constants.expoConfig?.extra?.maps === true );
