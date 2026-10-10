import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { AppBar } from "@/elements/app-bar";
import { Check } from "@/elements/check";
import { Press } from "@/elements/press";
import { Seam } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { useSavePreference } from "@/features/account/hooks/use-save-preference";
import { useLanguages } from "@/features/shell/hooks/use-languages";
import { retreat } from "@/features/shell/retreat";
import { languageByCode } from "@/model/language";
import { usePrefs } from "@/store/prefs";

type TongueProps = {
    label: string;
    note?: string | undefined;
    on: boolean;
    onPress: () => void;
};

function Tongue ({ label, note, on, onPress }: TongueProps) {

    const seamed = useContext(Seam);

    return (
        <Press feel="ripple" muted={1} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}>
            <View style={styles.row}>
                {seamed ? <View pointerEvents="none" style={styles.seam} /> : null}

                <Check round on={on} />

                <View style={styles.copy}>
                    <Text rank="body" style={styles.title}>{label}</Text>
                    {note ? <Text rank="caption" ink="soft">{note}</Text> : null}
                </View>
            </View>
        </Press>
    );

}

export function LanguageScreen () {

    const { t } = useTranslation();
    const languages = useLanguages();
    const persist = useSavePreference();
    const language = usePrefs(( state ) => state.language );
    const setLanguage = usePrefs(( state ) => state.setLanguage );

    const pick = ( value: string ) => {

        if ( value !== language ) persist("language", value, () => setLanguage(value) );

    };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("settings.language")} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.body}>
                <Group title={t("settings.language")}>
                    {languages.map(( item ) => (
                        <Tongue
                            key={item.key}
                            label={item.label}
                            note={languageByCode.get(item.key)?.en ?? item.note}
                            on={item.key === language}
                            onPress={() => pick(item.key) }
                        />
                    ))}
                </Group>
            </Scroll>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    body: {
        paddingHorizontal: theme.layout.gutter,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.composition.row.lead,
        minHeight: theme.composition.row.line,
        paddingHorizontal: theme.composition.row.pad,
        paddingVertical: theme.composition.row.padYTwo,
    },
    seam: {
        position: "absolute",
        top: 0,
        insetInlineStart: theme.composition.row.pad + theme.toggle.check + theme.composition.row.lead,
        insetInlineEnd: 0,
        height: theme.stroke.hair,
        backgroundColor: theme.line.hair,
    },
    copy: {
        flex: 1,
    },
    title: {
        lineHeight: Math.max(theme.text.body.latin.height, theme.text.body.arabic.height),
    },

}));
