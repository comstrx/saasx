import OfferBand from "@/components/offer-band";
import { offerBand } from "../hooks/use-offers";

type Props = { title: string; limit: number; art: string; source: "home" | "list" };

export default async function Band ({ title, limit, art, source }: Props) {

    const band = await offerBand(limit, source);

    if ( !band ) return null;

    return <OfferBand heading={title} art={`/assets/images/brand/${art}.webp`} {...band} />;

}
