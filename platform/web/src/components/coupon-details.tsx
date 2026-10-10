"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Facts from "@/elements/facts";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useCouponDetails } from "@/hooks/use-coupon-details";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import ReportDialog from "./report-dialog";

type Props = { couponId: number | null; onClose: () => void };

export default function CouponDetails ({ couponId, onClose }: Props) {

    const data = useCouponDetails(couponId);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Dialog
            open={couponId != null}
            onOpenChange={( open ) => { if ( !open ) onClose(); }}
            title={data.name}
            close={t("detail.close")}
            footer={(

                <Stack direction="row" align="center" justify="between" gap={3} width="full">

                    {couponId != null ? <ReportDialog feature="coupons" id={couponId} name={data.name} look="icon" /> : null}

                    <Button variant="ghost" onClick={onClose}>{t("detail.close")}</Button>

                </Stack>

            )}
        >

            {data.loading ? <SectionSkeleton /> : data.failed ? (

                <FormRetry id="coupon-details" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : (

                <Stack gap={5}>

                    {data.code ? (

                        <Surface tone="track" border={false} elevation="none" radius="md" padding={4}>

                            <Stack direction="row" align="center" justify="between" gap={3}>

                                <Stack gap={0}>

                                    <Text size="label" tone="muted">{t("detail.code")}</Text>

                                    <Text size="title" weight="bold" dir="ltr">{data.code}</Text>

                                </Stack>

                                <Button variant="outlined" size="small" rounded="full" onClick={() => { void data.copy(); }}>

                                    <Icon name="copy" />{t("detail.copy")}

                                </Button>

                            </Stack>

                        </Surface>

                    ) : null}

                    <Stack direction="row">

                        <Status tone={data.valid ? "positive" : "neutral"}>{t(data.valid ? "valid" : "expired")}</Status>

                    </Stack>

                    {data.about.map(( text ) => <Text key={text} size="small" tone="muted" dir="auto" wrap="pretty">{text}</Text>)}

                    {data.facts.length ? <Facts columns={2} items={data.facts} /> : null}

                </Stack>

            )}

        </Dialog>

    );

}
