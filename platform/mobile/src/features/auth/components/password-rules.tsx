import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { type PasswordPolicy, rules } from "@/std/password";

export function PasswordRules ({ value, policy }: { value: string; policy: PasswordPolicy }) {

    const { t } = useTranslation();

    return (
        <View style={styles.row}>
            {rules(value, policy).map(( rule ) => (
                <Badge shape="pill" look={rule.met ? "tone" : "field"} key={rule.key} label={t(`auth.rule.${ rule.key }`, { count: policy.min })} tint={rule.met ? "success" : "neutral"} icon={rule.met ? "check" : undefined} />
            ))}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: theme.space["2"],
    },

}));
