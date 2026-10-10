"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Table from "@/elements/table";
import Text from "@/elements/text";
import { type ActivityTarget, useActivityDetails } from "@/hooks/use-activity-details";
import Icon, { type IconName, isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { target: ActivityTarget | null; onClose: () => void };

function glyph ( name: string ): IconName {

    return isIconName(name) ? name : "info";

}
export default function ActivityDetails ({ target, onClose }: Props) {

    const data = useActivityDetails(target);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Dialog
            open={target != null}
            onOpenChange={( open ) => { if ( !open ) onClose(); }}
            title={data.title}
            close={t("close")}
            size="medium"
            footer={<Button variant="ghost" onClick={onClose}>{t("close")}</Button>}
        >

            {data.loading ? <SectionSkeleton /> : data.failed ? (

                <FormRetry id="activity-details" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : (

                <Stack gap={6}>

                    {data.body ? <Text tone="muted" dir="auto" wrap="pretty">{data.body}</Text> : null}

                    {data.facts.length ? (

                        <Facts columns={2} items={data.facts.map(( fact ) => ({ ...fact, icon: <Icon name={glyph(fact.icon)} /> }))} />

                    ) : null}

                    {data.changes.length ? (

                        <Stack gap={3}>

                            <Heading level={3} size="label">{t("detail.changes")}</Heading>

                            <Table
                                caption={t("detail.changes")}
                                columns={[{ key: "field", label: t("detail.field") }, { key: "value", label: t("detail.value") }]}
                                rows={data.changes.map(( change ) => ({
                                    key: change.key, cells: { field: change.field, value: change.value },
                                }))}
                            />

                        </Stack>

                    ) : null}

                </Stack>

            )}

        </Dialog>

    );

}
