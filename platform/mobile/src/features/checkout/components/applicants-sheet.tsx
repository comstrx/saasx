import { useTranslation } from "react-i18next";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { ApplicantFields } from "@/features/checkout/components/applicants";
import { type Applicant, applicantsReady } from "@/model/checkout";

type ApplicantsSheetProps = {
    open: boolean;
    applicants: readonly Applicant[];
    title?: string | undefined;
    body?: string | undefined;
    onAdd: () => void;
    onDrop: ( key: string ) => void;
    onEdit: ( key: string, patch: Partial<Omit<Applicant, "key">> ) => void;
    onSave: () => void;
    onClose: () => void;
};

export function ApplicantsSheet ({ open, applicants, title, body, onAdd, onDrop, onEdit, onSave, onClose }: ApplicantsSheetProps) {

    const { t } = useTranslation();

    const footer = (
        <Button label={t("checkout.save")} disabled={!applicantsReady(applicants)} onPress={onSave} />
    );

    return (
        <Sheet open={open} onClose={onClose} title={title ?? t("checkout.applicants")} footer={footer} tall scroll>
            <Box gap="4">
                <Text rank="body" ink="soft">{body ?? t("checkout.applicantsBody")}</Text>

                <ApplicantFields applicants={applicants} onAdd={onAdd} onDrop={onDrop} onEdit={onEdit} />
            </Box>
        </Sheet>
    );

}
