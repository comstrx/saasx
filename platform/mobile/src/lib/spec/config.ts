import routing from "@spec/routing";
import Constants from "expo-constants";

export { routing };

const selected = (Constants.expoConfig?.extra as { spec?: string } | undefined)?.spec;

if ( !selected ) throw new Error("The app config carries no spec identity; compile the spec first.");

export const identity = selected;

export const storage = { session: `${selected}.session`, preferences: `${selected}.preferences` } as const;
