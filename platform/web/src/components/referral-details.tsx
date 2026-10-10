"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import { useReferralDetails } from "@/hooks/use-referral-details";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import FactList from "./fact-list";
import FormRetry from "./form-retry";
import ReportDialog from "./report-dialog";
import SectionSkeleton from "./section-skeleton";

type Props = { referralId: number | null; onClose: () => void; onRemove: ( id: number ) => void };

export default function ReferralDetails ({ referralId, onClose, onRemove }: Props) {

    const data = useReferralDetails(referralId);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Dialog
            open={referralId != null}
            onOpenChange={( open ) => { if ( !open ) onClose(); }}
            title={data.name}
            close={t("detail.close")}
            hero={<Portrait size="large" src={data.image} alt="" initials={data.initials} />}
            footer={referralId != null ? (

                <Stack direction="row" align="center" justify="between" gap={2} width="full">

                    <ReportDialog feature="referrals" id={referralId} name={data.name} />

                    <Button variant="ghost" size="small" rounded="full" onClick={() => onRemove(referralId)}>

                        <Icon name="trash" />{t("remove")}

                    </Button>

                </Stack>

            ) : undefined}
        >

            {data.failed ? (

                <FormRetry id="referral-details" message={t("detail.unavailable")} label={common("retry")} onRetry={data.reload} />

            ) : data.loading ? <SectionSkeleton /> : <FactList compact items={data.facts} />}

        </Dialog>

    );

}
