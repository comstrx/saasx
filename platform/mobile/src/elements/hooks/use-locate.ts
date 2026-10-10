import * as Location from "expo-location";
import { useCallback } from "react";

const fresh = 60000;

export type Spot = {
    latitude: number;
    longitude: number;
};

export function useLocate () {

    return useCallback(async (): Promise<Spot> => {

        const permission = await Location.requestForegroundPermissionsAsync();

        if ( !permission.granted ) throw new Error("location-permission");

        const known = await Location.getLastKnownPositionAsync({ maxAge: fresh });
        const fix = known ?? await Location.getCurrentPositionAsync();

        return { latitude: fix.coords.latitude, longitude: fix.coords.longitude };

    }, []);

}
