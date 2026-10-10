import { createContext, useContext } from "react";
import type { PlaneName } from "@/theme/roles";

export const Surface = createContext<PlaneName>("canvas");

export const useSurface = (): PlaneName => useContext(Surface);
