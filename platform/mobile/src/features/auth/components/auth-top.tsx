import { useTranslation } from "react-i18next";
import { AppBar } from "@/elements/app-bar";
import { Round } from "@/elements/round";
import { LanguageSwitch, ThemeSwitch } from "@/features/auth/components/prefs";

type AuthTopProps = {
    onBack?: (() => void) | undefined;
};

export function AuthTop ({ onBack }: AuthTopProps) {

    const { t } = useTranslation();

    return (
        <AppBar
            brand
            plain
            actions={(
                <>
                    <ThemeSwitch />
                    <LanguageSwitch />
                    {onBack ? <Round icon="arrowForward" onPress={onBack} label={t("common.back")} /> : null}
                </>
            )}
        />
    );

}
