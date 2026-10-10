import { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

const Track = createContext<SharedValue<number> | null>(null);

export const Rail = Track.Provider;

export const useRail = (): SharedValue<number> | null => useContext(Track);
