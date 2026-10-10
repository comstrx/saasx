import ContactEditor from "@/components/contact-editor";
import FormSection from "@/components/form-section";
import Divider from "@/elements/divider";
import Stack from "@/elements/stack";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    email?: string | null; phone?: string | null; hasPassword: boolean; recover: string; country: string;
    emailVerified?: boolean | null; phoneVerified?: boolean | null;
};

export default function ProfileOverview ({ email, phone, emailVerified, phoneVerified, hasPassword, recover, country }: Props) {

    const t = useTranslations("account");

    return (

        <FormSection layout="split" title={t("contactTitle")} description={t("contactDescription")}>

            <Stack gap={6}>

                <ContactEditor field="email" value={email} verified={emailVerified}
                    hasPassword={hasPassword} recover={recover} country={country} />
                <Divider />
                <ContactEditor field="phone" value={phone} verified={phoneVerified}
                    hasPassword={hasPassword} recover={recover} country={country} />

            </Stack>

        </FormSection>

    );

}
