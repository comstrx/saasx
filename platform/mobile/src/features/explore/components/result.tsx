import { useTranslation } from "react-i18next";
import { Tile } from "@/components/tile";
import type { Flight } from "@/elements/flight";
import { usePriceTag } from "@/features/catalog/hooks/use-price-tag";
import { glyphOf } from "@/features/catalog/marks";
import { dealOf, type Listing } from "@/model/catalog";
import { lodges } from "@/model/search";
import { formatNumber } from "@/std/number";
import { acclaimed } from "@/std/rating";

type SearchResultProps = {
    stay: Listing;
    width: number;
    alone: boolean;
    favorite: boolean;
    onPress: () => void;
    onFavorite: () => void;
    flight?: Flight | undefined;
};

export function SearchResult ({ stay, width, alone, favorite, onPress, onFavorite, flight }: SearchResultProps) {

    const { t, i18n } = useTranslation();
    const tag = usePriceTag();

    const sold = stay.price !== null && stay.price.amount > 0;
    const scored = stay.reviews > 0 && stay.rating > 0;
    const voice = lodges(stay.capabilities) ? "stay" : "item";

    const facts = [
        stay.duration > 0 && stay.durationUnit
            ? t(`details.specs.span.${ stay.durationUnit }`, { count: stay.duration, value: formatNumber(i18n.language, stay.duration), defaultValue: "" })
            : null,
        stay.capacity > 0 ? t("details.capacity", { count: stay.capacity }) : null,
        stay.digital ? t("details.specs.digital") : null,
        stay.orders > 0 ? t("details.orders", { count: stay.orders, context: dealOf(stay.capabilities) }) : null,
    ];

    const badge = acclaimed(stay.rating, stay.reviews)
        ? { label: t(`details.voice.${ voice }.guestFavorite`), glass: true }
        : stay.fresh && !scored ? { label: t("listing.fresh"), tint: "brand" as const } : undefined;

    return (
        <Tile
            alone={alone}
            title={stay.name}
            note={stay.place || undefined}
            image={stay.image}
            images={stay.images}
            icon={glyphOf(stay.type)}
            facts={facts.filter(Boolean).slice(0, 1)}
            score={scored ? stay.rating : undefined}
            reviews={scored ? stay.reviews : undefined}
            price={sold ? tag(stay.price, stay.unit, stay.sale) : undefined}
            ask={sold ? undefined : t("listing.onRequest")}
            tag={badge}
            loved={favorite}
            loveLabel={t(favorite ? "listing.unsave" : "listing.save")}
            onLove={() => onFavorite() }
            onPress={onPress}
            width={width}
            flight={flight}
        />
    );

}
