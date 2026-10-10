import FacetedResults from "@/components/faceted-results";
import FailureNotice from "@/components/failure-notice";
import type { Route, Screen } from "@/lib/spec/feature";
import { searchResults } from "../hooks/use-results";

type Props = {
    screen: Screen; route: Route; limit: number; groups: readonly string[]; tabs: boolean;
    map: { tiles: string; credit: string };
};

export default async function Results ( props: Props ) {

    const result = await searchResults(props);

    if ( result.failed ) return <FailureNotice {...result.failure} />;

    const { failed: _, ...view } = result;

    return <FacetedResults {...view} />;

}
