"use client";

import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Art from "@/elements/art";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useLevelDetails } from "@/hooks/use-level-details";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import ReactionToggle from "./reaction-toggle";
import ReportDialog from "./report-dialog";

type Props = { levelId: number | null; art: string; onClose: () => void };

export default function LevelDetails ({ levelId, art, onClose }: Props) {

    const data = useLevelDetails(levelId);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Dialog
            open={levelId != null}
            onOpenChange={( open ) => { if ( !open ) onClose(); }}
            title={data.name || t("ladder")}
            close={t("close")}
            size="medium"
            hero={<Art src={data.image ?? art} size="medium" glow />}
            description={data.description ?? undefined}
            footer={(

                <Stack direction="row" align="center" justify="between" gap={3} width="full">

                    {levelId != null ? <ReportDialog feature="levels" id={levelId} name={data.name} look="icon" /> : null}

                    <Button variant="ghost" onClick={onClose}>{t("close")}</Button>

                </Stack>

            )}
        >

            {data.loading ? <SectionSkeleton /> : data.failed ? (

                <FormRetry id="level-details" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : (

                <Stack gap={6}>

                    {data.perks.length ? (

                        <Stack gap={3}>

                            <Heading level={3} size="label">{t("perksTitle")}</Heading>

                            <Facts columns={2} raised items={data.perks.map(( perk ) => ({ ...perk, icon: <Icon name="sparkle" /> }))} />

                        </Stack>

                    ) : null}

                    {data.benefits.length ? (

                        <Stack gap={3}>

                            <Heading level={3} size="label">{t("benefitsTitle")}</Heading>

                            <Stack as="ul" gap={2}>

                                {data.benefits.map(( benefit ) => (

                                    <Stack as="li" key={benefit.key} direction="row" align="center" gap={3}>

                                        <Icon name="check-circle" size="md" weight="fill" tone="success" />

                                        <Text size="small" dir="auto">{benefit.label}</Text>

                                    </Stack>

                                ))}

                            </Stack>

                        </Stack>

                    ) : null}

                    {data.conditions.length ? (

                        <Stack gap={3}>

                            <Heading level={3} size="label">{t("reachTitle")}</Heading>

                            <Stack as="ul" gap={2}>

                                {data.conditions.map(( condition ) => (

                                    <Stack as="li" key={condition.key} direction="row" align="center" gap={3}>

                                        <Icon name="gauge" size="md" tone="accent" />

                                        <Text size="small">{condition.label}</Text>

                                    </Stack>

                                ))}

                            </Stack>

                        </Stack>

                    ) : null}

                    {!data.perks.length && !data.benefits.length && !data.conditions.length ? (

                        <Text size="small" tone="muted">{t("levelEmpty")}</Text>

                    ) : null}

                    {levelId != null ? (

                        <ReactionToggle
                            feature="levels" id={levelId}
                            labels={{ question: t("levelReaction"), like: t("levelLike"), dislike: t("levelDislike") }}
                        />

                    ) : null}

                </Stack>

            )}

        </Dialog>

    );

}
