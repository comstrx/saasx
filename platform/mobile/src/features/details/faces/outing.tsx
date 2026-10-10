import { useTranslation } from "react-i18next";
import type { IconName } from "@/elements/icon";
import type { DeckProps } from "@/features/details/faces/props";
import { DeckPromises, DeckStack, type Pledge } from "@/features/details/faces/shell";
import { traitText } from "@/features/details/lang";
import { formatNumber } from "@/std/number";

export function OutingDeck ({ detail }: DeckProps) {

    const { t, i18n } = useTranslation();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const spoken = detail.features.find(( row ) => row.key === "languages" );
    const guided = detail.features.find(( row ) => row.key === "guided" && row.included !== false );
    const pickup = detail.features.find(( row ) => row.key === "pickup_included" && row.included !== false );

    const span = detail.duration > 0
        ? t(`details.specs.span.${ detail.durationUnit || "hour" }`, { count: detail.duration, value: count(detail.duration) })
        : "";

    const heads = detail.capacity > 0 ? detail.capacity : detail.adults;

    const promises: readonly Pledge[] = [
        ...( span
            ? [ { key: "span", icon: "clock" as IconName, title: span, note: t("details.duration") } ]
            : [] ),
        ...( guided
            ? [ { key: "guide", icon: "award" as IconName, title: guided.label, note: t("details.brief.guideOn") } ]
            : [] ),
        ...( pickup
            ? [ { key: "pickup", icon: "bus" as IconName, title: pickup.label, note: t("details.face.outing.pickup") } ]
            : [] ),
        ...( detail.place
            ? [ { key: "meet", icon: "location" as IconName, title: detail.place, note: t("details.face.outing.meet") } ]
            : [] ),
        ...( heads > 0
            ? [ { key: "group", icon: "users" as IconName, title: t("details.featureUnit.group_size", { value: count(heads) }), note: t("details.face.outing.group") } ]
            : [] ),
        ...( spoken
            ? [ { key: "speech", icon: "language" as IconName, title: traitText(spoken, t, i18n.language), note: spoken.label } ]
            : [] ),
    ];

    return (
        <DeckStack>
            {promises.length > 0 ? <DeckPromises items={promises} /> : null}
        </DeckStack>
    );

}
