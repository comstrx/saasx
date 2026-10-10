import { useTranslation } from "react-i18next";
import { Tile, type TileShape } from "@/components/tile";
import type { Flight } from "@/elements/flight";
import type { IconName } from "@/elements/icon";
import { usePriceTag } from "@/features/catalog/hooks/use-price-tag";
import { badgeOf, type Listing, reviewed } from "@/model/catalog";

type ListingCardProps = {
    listing: Listing;
    icon?: IconName | undefined;
    width?: number | undefined;
    shape?: TileShape | undefined;
    favorite?: boolean | undefined;
    onPress?: (() => void) | undefined;
    onFavorite?: (() => void) | undefined;
    flight?: Flight | undefined;
};

export function ListingCard ({ listing, icon, width, shape, favorite, onPress, onFavorite, flight }: ListingCardProps) {

    const { t } = useTranslation();
    const tag = usePriceTag();

    const money = listing.price;
    const rank = badgeOf(listing);
    const saved = favorite ?? listing.favorite;

    return (
        <Tile
            title={listing.name}
            note={listing.place}
            image={listing.image}
            icon={icon ?? "stay"}
            width={width}
            shape={shape}
            score={reviewed(listing) ? listing.rating : undefined}
            reviews={listing.reviews > 0 ? listing.reviews : undefined}
            price={tag(money, listing.unit, listing.sale)}
            tag={rank && rank !== "rated" ? { label: t(`listing.${ rank }`), tint: "brand" } : undefined}
            loved={saved}
            onLove={onFavorite ? () => onFavorite() : undefined}
            onPress={onPress}
            flight={flight}
        />
    );

}
