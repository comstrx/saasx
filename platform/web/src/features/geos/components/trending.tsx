import DestinationMosaic from "@/components/destination-mosaic";
import { trending } from "../hooks/use-geos";

type Props = { title: string; description: string; limit: number };

export default async function Trending ({ title, description, limit }: Props) {

    const spots = await trending(limit);

    if ( !spots || spots.items.length < 3 ) return null;

    return <DestinationMosaic title={title} description={description || undefined} {...spots} />;

}
