import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

export function useDirtyGuard ( dirty: boolean, leave: string ): void {
    const navigation = useNavigation();

    useEffect(() => {
        if ( !dirty ) return undefined;

        return navigation.addListener("beforeRemove", ( event ) => {
            event.preventDefault();
            Alert.alert(leave, undefined, [
                { text: "✕", style: "cancel" },
                { text: "→", style: "destructive", onPress: () => navigation.dispatch(event.data.action) },
            ]);
        });
    }, [dirty, leave, navigation]);
}
