import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Group } from "@/components/group";
import type { IconName } from "@/elements/icon";
import { Row } from "@/elements/row";
import { concepts } from "@/features/shell/concepts";

const pages = [
    { key: "about", icon: "info", title: "legal.about", note: "account.aboutNote" },
    { key: "privacy", icon: "shield", title: "profile.privacy", note: "account.privacyNote" },
    { key: "terms", icon: "doc", title: "account.terms", note: "account.termsNote" },
] as const satisfies readonly { key: keyof typeof concepts; icon: IconName; title: string; note: string }[];

export function LegalRows ({ except }: { except?: string | undefined }) {

    const { t } = useTranslation();

    return (
        <Group>
            {pages.filter(( page ) => page.key !== except ).map(( page ) => (
                <Row key={page.key} plated tone={concepts[page.key]} icon={page.icon} title={t(page.title)} note={t(page.note)} onPress={() => router.push(`/legal/${ page.key }`) } />
            ))}
        </Group>
    );

}
