import Constants from "expo-constants";
import config from "../../app.json";

export const release = {
    version: Constants.expoConfig?.version ?? config.expo.version,
} as const;
