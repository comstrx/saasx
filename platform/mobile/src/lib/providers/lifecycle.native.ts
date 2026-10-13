import { AppState } from "react-native";

/**
 * Tells the listener each time the app leaves the foreground.
 */
export function onBackground ( listener: () => void ): () => void {

    const subscription = AppState.addEventListener("change", ( state ) => { if ( state !== "active" ) listener(); });

    return () => subscription.remove();

}
