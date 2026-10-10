import { useSyncExternalStore } from "react";
import { current, observe } from "@/api/client";

export const useSigned = (): boolean => useSyncExternalStore(observe, () => Boolean(current().token));

export const useViewer = (): number => useSyncExternalStore(observe, () => current().viewer);

export const useCurrency = (): string => useSyncExternalStore(observe, () => current().currency);
