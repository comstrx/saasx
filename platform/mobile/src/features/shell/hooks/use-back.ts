import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useBack ( onBack: () => void ) {

    useFocusEffect(useCallback(() => {

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {

            onBack();

            return true;

        });

        return () => subscription.remove();

    }, [ onBack ]));

}
