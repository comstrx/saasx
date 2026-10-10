"use client";

import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { type AvailabilityInput, useAvailability } from "@/hooks/use-availability";
import Icon from "@/icons/icon";
import { useLocale, useTimeZone, useTranslations } from "@/lib/providers/intl";
import { day, instant } from "@/lib/std/format";

export default function AvailabilityStatus ({ input }: { input: AvailabilityInput }) {

    const result = useAvailability(input);
    const locale = useLocale();
    const timeZone = useTimeZone();
    const t = useTranslations("booking");
    const common = useTranslations("common");
    const failed = result.state === "failed" || result.state === "unknown";

    return (

        <Stack gap={3}>

            <Text size="small" tone={failed ? "danger" : "muted"} role={failed ? "alert" : "status"}>

                {t(`availability.${result.state}`)}

            </Text>

            {failed ? <Button variant="outlined" onClick={result.reload}>{common("retry")}</Button> : null}

            {result.state === "available" && result.data?.slotted ? (

                <Stack gap={2}>

                    <Text size="small" weight="semibold">{t("availableTimes")}</Text>

                    {result.data.days.flatMap(( entry ) => (entry.slots ?? [])
                        .filter(( slot ) => slot.open && (slot.units == null || slot.units >= input.quantity))
                        .map(( slot ) => (

                            <Stack key={slot.starts_at} direction="row" gap={2} align="center">

                                <Icon name="clock" size="sm" />

                                <Text size="small">

                                    {day(new Date(instant(slot.starts_at)), locale, { dateStyle: "medium", timeStyle: "short", timeZone })}

                                </Text>

                            </Stack>

                        )))}

                </Stack>

            ) : null}

        </Stack>

    );

}
