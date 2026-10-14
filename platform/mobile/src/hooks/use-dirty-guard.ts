import { useEffect } from "react";
import { Alert } from "react-native";
import { useEntry } from "@/hooks/use-router";
import { history } from "@/stores/navigation";

export function useDirtyGuard ( dirty: boolean, leave: string ): void {

    const { key } = useEntry();

    useEffect(() => {

        if ( !dirty ) return undefined;

        return history.guard(key, ( proceed ) => {

            Alert.alert(leave, undefined, [
                { text: "✕", style: "cancel" },
                { text: "→", style: "destructive", onPress: proceed },
            ]);

        });

    }, [dirty, leave, key]);

}
