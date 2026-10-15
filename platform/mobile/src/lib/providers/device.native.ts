import { createDevice, type Device, type Grant, type Info, type Permission, type Picked, unknownInfo } from "engine/device";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Localization from "expo-localization";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { AccessibilityInfo, Appearance, Dimensions, Linking, PixelRatio, Platform } from "react-native";

let reduced = false;

const scheme = ( value: string | null | undefined ): "light" | "dark" | null => (value === "dark" || value === "light" ? value : null);
const grant = ( status: string, canAskAgain = true ): Grant => (status === "granted" ? "granted" : status === "denied" && !canAskAgain ? "denied" : status === "denied" ? "denied" : "prompt");

void AccessibilityInfo.isReduceMotionEnabled().then(( value ) => { reduced = value; });

function screen (): Info["screen"] {

    const { width, height } = Dimensions.get("window");

    return { width, height, scale: PixelRatio.get() };

}
function info (): Info {

    const locales = Localization.getLocales().map(( item ) => item.languageTag);

    return {
        ...unknownInfo,
        platform: Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "unknown",
        os: Platform.OS,
        version: String(Platform.Version),
        language: locales[0] ?? unknownInfo.language,
        languages: locales.length ? locales : unknownInfo.languages,
        timezone: Localization.getCalendars()[0]?.timeZone ?? unknownInfo.timezone,
        touch: true,
        screen: screen(),
        colorScheme: scheme(Appearance.getColorScheme()),
        reducedMotion: reduced,
    };

}
async function state ( permission: Permission ): Promise<Grant> {

    if ( permission === "location" ) return grant((await Location.getForegroundPermissionsAsync()).status);
    if ( permission === "camera" ) return grant((await ImagePicker.getCameraPermissionsAsync()).status);
    if ( permission === "photos" ) return grant((await ImagePicker.getMediaLibraryPermissionsAsync()).status);
    if ( permission === "notifications" ) return grant((await Notifications.getPermissionsAsync()).status);

    return "unsupported";

}
async function ask ( permission: Permission ): Promise<Grant> {

    if ( permission === "location" ) return grant((await Location.requestForegroundPermissionsAsync()).status);
    if ( permission === "camera" ) return grant((await ImagePicker.requestCameraPermissionsAsync()).status);
    if ( permission === "photos" ) return grant((await ImagePicker.requestMediaLibraryPermissionsAsync()).status);
    if ( permission === "notifications" ) return grant((await Notifications.requestPermissionsAsync()).status);

    return "unsupported";

}
async function pick ( source: "camera" | "library" ): Promise<Picked | null> {

    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.85, allowsEditing: false };
    const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];

    if ( !asset ) return null;

    return { uri: asset.uri, name: asset.fileName ?? `photo.${(asset.mimeType ?? "image/jpeg").split("/")[1] ?? "jpg"}`, type: asset.mimeType ?? "image/jpeg" };

}
async function position (): Promise<{ latitude: number; longitude: number; accuracy: number; at: number } | null> {

    try {

        const found = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

        return { latitude: found.coords.latitude, longitude: found.coords.longitude, accuracy: found.coords.accuracy ?? 0, at: found.timestamp };

    }
    catch { return null; }

}
async function pushToken (): Promise<string | null> {

    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

    try { return projectId ? (await Notifications.getExpoPushTokenAsync({ projectId })).data : (await Notifications.getDevicePushTokenAsync()).data as string; }
    catch { return null; }

}
export const device: Device = createDevice({
    info,
    state,
    ask,
    pick,
    pushToken,
    position,
    watch: ( fact, listener ) => {

        const emit = listener as ( value: unknown ) => void;

        if ( fact === "colorScheme" ) return Appearance.addChangeListener(({ colorScheme }) => emit(scheme(colorScheme))).remove;
        if ( fact === "screen" ) return Dimensions.addEventListener("change", () => emit(screen())).remove;
        if ( fact === "reducedMotion" ) return AccessibilityInfo.addEventListener("reduceMotionChanged", ( value ) => { reduced = value; emit(value); }).remove;

        if ( fact === "location" ) {

            let stopped = false;
            let off: (() => void) | undefined;

            void Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced }, ( position ) => emit({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy ?? 0, at: position.timestamp })).then(( subscription ) => {

                if ( stopped ) subscription.remove();
                else off = () => subscription.remove();

            });

            return () => { stopped = true; off?.(); };

        }

        return () => undefined;

    },
    open: async ( target ) => {

        if ( target === "settings" ) { await Linking.openSettings(); return true; }
        if ( !(await Linking.canOpenURL(target)) ) return false;

        await Linking.openURL(target);

        return true;

    },
});
