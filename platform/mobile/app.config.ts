import type { ConfigContext, ExpoConfig } from "expo/config";
import { type ConfigPlugin, withAndroidManifest } from "expo/config-plugins";
import brand from "./brand.json";
import surfaces from "./src/brand/surfaces.json";

type PluginEntry = string | [ string ] | [ string, Record<string, unknown> ];

const spoken = brand.words.ar.title;

const mapsKey = process.env.GOOGLE_MAPS_KEY ?? "";

const options: Record<string, Record<string, unknown>> = {
    "expo-splash-screen": {
        backgroundColor: surfaces.light,
        dark: { backgroundColor: surfaces.dark },
    },
    "expo-audio": {
        microphonePermission: `يستخدم ${ spoken } الميكروفون لتسجيل الرسائل الصوتية داخل المحادثة.`,
    },
    "expo-image-picker": {
        photosPermission: `يستخدم ${ spoken } مكتبة الصور لإرسال الصور والفيديو داخل المحادثة.`,
        cameraPermission: `يستخدم ${ spoken } الكاميرا لالتقاط صور وإرسالها داخل المحادثة.`,
        microphonePermission: `يستخدم ${ spoken } الميكروفون لتسجيل الرسائل الصوتية داخل المحادثة.`,
    },
    "expo-location": {
        locationWhenInUsePermission: `يستخدم ${ spoken } موقعك لإظهاره على الخريطة بين الأماكن من حولك.`,
    },
    "react-native-maps": mapsKey ? { androidGoogleMapsApiKey: mapsKey } : {},
};

const spoke = ( plugins: readonly PluginEntry[] ): PluginEntry[] => plugins.map(( entry ) => {

    const [ name, given ] = Array.isArray(entry) ? entry : [ entry, undefined ];
    const said = options[name];

    return said ? [ name, { ...given, ...said } ] as PluginEntry : entry;

});

// Preview builds let `perfetto` read the app's own trace slices on a user phone; debuggability stays off.
const profileable: ConfigPlugin = ( config ) => withAndroidManifest(config, ( mod ) => {

    const application = mod.modResults.manifest.application?.[0];

    if ( application ) Object.assign(application, { profileable: [ { $: { "android:shell": "true" } } ] });

    return mod;

});

const shaped = ( { config }: ConfigContext ): ExpoConfig => ({
    ...config,
    name: brand.title,
    slug: brand.name,
    scheme: brand.scheme,
    plugins: spoke(( config.plugins ?? [] ) as PluginEntry[]),
    ios: {
        ...config.ios,
        bundleIdentifier: brand.package,
    },
    android: {
        ...config.android,
        package: brand.package,
    },
    extra: {
        ...config.extra,
        maps: Boolean(mapsKey),
    },
});

export default ( context: ConfigContext ): ExpoConfig =>
    process.env.EAS_BUILD_PROFILE === "preview" ? profileable(shaped(context)) : shaped(context);
