import type { ReactElement } from "react";
import { CoverDeck } from "@/features/details/faces/cover";
import { GoodsDeck } from "@/features/details/faces/goods";
import { HotelDeck } from "@/features/details/faces/hotel";
import { OutingDeck } from "@/features/details/faces/outing";
import { PlaceDeck } from "@/features/details/faces/place";
import type { DeckProps } from "@/features/details/faces/props";
import { RouteDeck } from "@/features/details/faces/route";
import { ServiceDeck } from "@/features/details/faces/service";
import { StageDeck } from "@/features/details/faces/stage";
import { VisaDeck } from "@/features/details/faces/visa";
import { type DetailFace, faceOf } from "@/model/detail";

const decks: Record<DetailFace, ( props: DeckProps ) => ReactElement> = {
    hotel: HotelDeck,
    place: PlaceDeck,
    route: RouteDeck,
    goods: GoodsDeck,
    visa: VisaDeck,
    cover: CoverDeck,
    stage: StageDeck,
    outing: OutingDeck,
    service: ServiceDeck,
};

export function Deck ( props: DeckProps ) {

    const Face = decks[faceOf(props.detail)];

    return <Face {...props} />;

}
