import { reloadAppAsync } from "expo";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { setBackgroundColorAsync } from "expo-system-ui";
import { type ReactNode, useEffect, useState } from "react";
import { Appearance, I18nManager, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { i18n, start, uiLocale } from "@/brand/i18n";
import { Adopt } from "@/features/boot/adopt";
import { devPrefs } from "@/features/boot/dev";
import { face, turning } from "@/features/boot/direction";
import { useEntry } from "@/features/boot/entry";
import { Guard } from "@/features/boot/guard";
import { Notices } from "@/features/boot/notices";
import { useOpening } from "@/features/boot/opening";
import { Queries } from "@/features/boot/queries";
import { Live, Tune } from "@/features/boot/realtime";
import { Splash } from "@/features/boot/splash";
import { Wording } from "@/features/boot/wording";
import { Push } from "@/features/push";
import { notify } from "@/store/notice";
import { isRtl, usePrefs } from "@/store/prefs";
import { useSession } from "@/store/session";
import { modeTheme, themes } from "@/theme";
import { fontAssets } from "@/theme/fonts";
import { launchMotion } from "@/theme/motion";

SplashScreen.preventAutoHideAsync();

export function Boot ({ children }: { children: ReactNode }) {

    const [ fontsLoaded, fontError ] = useFonts(fontAssets);
    const [ ready, setReady ] = useState(false);
    const fontsReady = fontsLoaded || Boolean(fontError);
    const elapsed = useOpening(launchMotion.duration, fontsReady);
    const [ scheme, setScheme ] = useState<"light" | "dark">(() => modeTheme(usePrefs.getState().theme));
    const storyPending = usePrefs(( state ) => state.storyPending );
    const restored = useSession(( state ) => state.restored );
    const language = usePrefs(( state ) => state.language );
    const mode = usePrefs(( state ) => state.theme );

    useEffect(() => {

        const prefs = usePrefs.getState();

        if ( __DEV__ && devPrefs ) {

            prefs.setLanguage(devPrefs.language);
            prefs.setTheme(devPrefs.theme);

        }

        useSession.getState().restore();

    }, []);

    useEffect(() => {

        const apply = () => {

            const next = modeTheme(mode);

            setScheme(next);
            UnistylesRuntime.setTheme(next);
            setBackgroundColorAsync(themes[next].plane.canvas);

        };

        apply();

        if ( mode !== "system" ) return;

        const watcher = Appearance.addChangeListener(apply);

        return () => watcher.remove();

    }, [ mode ]);

    useEffect(() => {

        let active = true;

        void start(uiLocale(language)).then(() => {

            if ( !active ) return;

            setReady(true);

            if ( isRtl(language) === I18nManager.isRTL || turning() ) return;

            face(language);
            void reloadAppAsync("Language direction changed").catch(() => notify(i18n.t("common.restartNeeded")));

        });

        return () => { active = false; };

    }, [ language ]);

    useEffect(() => {

        if ( fontsReady ) SplashScreen.hide();

    }, [ fontsReady ]);

    const opened = ready && restored;

    useEntry(opened);

    if ( !fontsReady ) return <View style={styles.canvas} />;

    return (
        <GestureHandlerRootView style={styles.canvas} onLayout={SplashScreen.hide}>
            <View style={styles.root}>
                <SystemBars style={scheme === "dark" ? "light" : "dark"} />
                <Queries>
                    <KeyboardProvider>
                        <View style={styles.root}>
                            <Adopt />
                            <Tune />
                            <Live />
                            <Push />
                            <Guard>{opened ? <Wording>{children}</Wording> : null}</Guard>
                            <Notices watching={opened} />
                        </View>
                    </KeyboardProvider>
                </Queries>
                {!elapsed && !storyPending ? <Splash /> : null}
            </View>
        </GestureHandlerRootView>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    root: {
        flex: 1,
    },
    canvas: {
        flex: 1,
        backgroundColor: theme.plane.canvas,
    },

}));
