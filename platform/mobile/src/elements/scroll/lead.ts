import { I18nManager } from "react-native";

type Travel = {
    contentOffset: { x: number };
    contentSize: { width: number };
    layoutMeasurement: { width: number };
};

const mirrored = I18nManager.isRTL;

export const leadOf = ( travel: Travel ): number => {

    "worklet";

    return mirrored ? travel.contentSize.width - travel.layoutMeasurement.width - travel.contentOffset.x : travel.contentOffset.x;

};
