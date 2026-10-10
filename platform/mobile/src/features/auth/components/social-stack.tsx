import { openURL } from "expo-linking";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { identity } from "@/brand";
import { Button } from "@/elements/button";
import { SeparatorLabel } from "@/elements/separator-label";
import { Brandmark, type BrandName } from "@/features/auth/components/brandmark";
import { useSocialProviders, useSocialRedirect } from "@/query/auth";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

const known: Record<string, BrandName> = {
    google: "google",
    facebook: "facebook",
    apple: "apple",
};

const callback = `${ identity.scheme }://auth/social`;

export function SocialStack () {

    const { t } = useTranslation();
    const theme = useTheme();
    const providers = useSocialProviders();
    const { mutateAsync: redirect } = useSocialRedirect();

    const [ opening, setOpening ] = useState("");

    const served = ( providers.data ?? [] ).filter(( name ) => known[name] !== undefined );

    if ( served.length === 0 ) return null;

    const open = async ( provider: string ) => {

        setOpening(provider);

        try {

            await openURL(await redirect({ provider, callback }));

        }
        catch {

            notify(t("auth.socialFailed"));

        }
        finally {

            setOpening("");

        }

    };

    return (
        <View style={styles.block}>
            <SeparatorLabel label={t("common.or")} />

            <View style={styles.row}>
                {served.map(( provider ) => (
                    <Button
                        key={provider}
                        kind="soft"
                        figure={<Brandmark name={known[provider] as BrandName} size={theme.icon.md} />}
                        label={t(`auth.with${ provider.charAt(0).toUpperCase() }${ provider.slice(1) }`, { defaultValue: provider })}
                        loading={opening === provider}
                        disabled={opening.length > 0 && opening !== provider}
                        onPress={() => { void open(provider); }}
                    />
                ))}
            </View>
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    block: {
        gap: theme.space["4"],
    },
    row: {
        gap: theme.space["3"],
    },

}));
