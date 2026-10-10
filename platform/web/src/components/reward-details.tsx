"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Facts from "@/elements/facts";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useRewardDetails } from "@/hooks/use-reward-details";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { rewardId: number | null; onClose: () => void };

export default function RewardDetails ({ rewardId, onClose }: Props) {

    const data = useRewardDetails(rewardId);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Dialog
            open={rewardId != null}
            onOpenChange={( open ) => { if ( !open ) onClose(); }}
            title={data.name}
            description={t("earnBody")}
            close={t("close")}
            footer={<Button variant="ghost" onClick={onClose}>{t("close")}</Button>}
        >

            {data.loading ? <SectionSkeleton /> : data.failed ? (

                <FormRetry id="reward-details" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : (

                <Stack gap={5}>

                    {data.code ? (

                        <Surface tone="track" border={false} elevation="none" radius="md" padding={4}>

                            <Stack direction="row" align="center" justify="between" gap={3}>

                                <Text size="title" weight="bold" dir="ltr">{data.code}</Text>

                                <Button variant="outlined" size="small" rounded="full" onClick={() => { void data.copy(); }}>

                                    <Icon name="copy" />{t("detail.copy")}

                                </Button>

                            </Stack>

                        </Surface>

                    ) : null}

                    {data.facts.length ? <Facts columns={2} items={data.facts} /> : null}

                </Stack>

            )}

        </Dialog>

    );

}
