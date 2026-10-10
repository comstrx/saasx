import { createContext, type ReactNode, useContext } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { useForeground } from "@/elements/hooks/use-foreground";

const Activity = createContext(true);

export function MotionActivity ({ active, children }: { active: boolean; children: ReactNode }) {

    return <Activity value={active}>{children}</Activity>;

}

export function useMotionActive (): boolean {

    const active = useContext(Activity);
    const foreground = useForeground();
    const still = useReducedMotion();

    return active && foreground && !still;

}
