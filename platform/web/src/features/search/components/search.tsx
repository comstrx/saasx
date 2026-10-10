import SearchBar from "@/components/search-bar";
import { searchSheet } from "../hooks/use-sheet";

type Props = { target: string; dates: string; guests: boolean; source: string };

export default async function Search ({ target, dates, guests, source }: Props) {

    const sheet = await searchSheet(target);

    return (

        <SearchBar
            target={target} dates={dates === "stay" || dates === "start" ? dates : "none"} guests={guests} sheet={sheet}
            source={source === "places" || source === "categories" ? source : "all"}
        />

    );

}
