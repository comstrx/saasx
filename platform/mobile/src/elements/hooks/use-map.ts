import { Linking } from "react-native";

type MapPoint = {
    latitude: number;
    longitude: number;
    label?: string | undefined;
};

export function useMap () {

    return ({ latitude, longitude, label }: MapPoint) => {

        const query = encodeURIComponent(`${ latitude },${ longitude }${ label ? ` (${ label })` : "" }`);

        return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${ query }`);

    };

}
