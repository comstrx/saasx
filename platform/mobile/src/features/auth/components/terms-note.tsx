import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text } from "@/elements/text";

export function TermsNote () {

    const { t } = useTranslation();

    return (
        <Text rank="footnote" align="center">
            {`${ t("auth.termsLead") } `}
            <Text rank="footnote" tint="brand" accessibilityRole="link" onPress={() => router.push("/legal/terms") }>{t("auth.termsService")}</Text>
            {" "}
            <Text rank="footnote" tint="brand" accessibilityRole="link" onPress={() => router.push("/legal/privacy") }>{t("auth.termsPrivacy")}</Text>
        </Text>
    );

}
