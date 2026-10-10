import { requireOptionalNativeModule } from "expo";
import { Appearance } from "react-native";

type AppearanceMode = "system" | "light" | "dark";
type NativeAppearance = { setMode: ( mode: AppearanceMode ) => Promise<void> };

const native = requireOptionalNativeModule<NativeAppearance>("NativeAppearance");

const fallback = ( mode: AppearanceMode ): void => Appearance.setColorScheme?.(mode === "system" ? "unspecified" : mode);

export const applyAppearance = async ( mode: AppearanceMode ): Promise<void> => {

    if ( !native ) return fallback(mode);

    await native.setMode(mode).catch(() => fallback(mode));

};
