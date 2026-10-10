import CountryAtlas from "@/components/country-atlas";
import { atlas } from "../hooks/use-destinations";

type Props = { title: string; description: string };

export default async function Atlas ({ title, description }: Props) {

    const data = await atlas();

    if ( !data ) return null;

    return <CountryAtlas title={title || data.label} description={description || undefined} items={data.items} />;

}
