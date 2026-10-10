import { createContext, useContext } from "react";
import { useUnistyles } from "react-native-unistyles";
import { useLane } from "@/store/lane";
import { useTheme } from "@/theme/use-theme";

const Reserve = createContext(0);

export const Floor = Reserve.Provider;

export const useFloor = (): number => useContext(Reserve);

export const useLaneFloor = (): number => {

    const theme = useTheme();
    const { rt: { insets } } = useUnistyles();

    return insets.bottom + theme.layout.laneFloor;

};

export const useClearance = ( docked: boolean ): number => {

    const theme = useTheme();
    const { rt: { insets } } = useUnistyles();
    const reserve = useContext(Reserve);
    const held = useLane(( state ) => state.held );
    const lane = useLaneFloor();
    const base = reserve > 0 ? reserve + theme.space["6"] : insets.bottom + ( docked ? theme.layout.dockClearance : theme.space["7"] );

    return held ? Math.max(base, lane + theme.layout.lane + theme.space["3"]) : base;

};
