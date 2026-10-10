import { useWindowDimensions } from "react-native";
import type { Flight } from "@/elements/flight";
import { coverFrame } from "@/features/details/components/cover";

export const coverFlightKey = ( id: number ): string => `catalog-${ id }`;

export function useCoverFlight (): ( id: number ) => Flight {

    const { width } = useWindowDimensions();

    return ( id ) => ({ key: coverFlightKey(id), to: coverFrame(width) });

}
