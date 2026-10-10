import OfferBoard from "@/components/offer-board";
import { board } from "../hooks/use-board";

type Props = { art: string };

export default async function Board ({ art }: Props) {

    const data = await board();

    if ( !data ) return null;

    return <OfferBoard {...data} art={`/assets/images/brand/${art}.webp`} />;

}
