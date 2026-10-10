import FacetedResults from "@/components/faceted-results";
import FailureNotice from "@/components/failure-notice";
import type { Route, Screen } from "@/lib/spec/feature";
import { faceted } from "../hooks/use-faceted";

type Props = {
    screen: Screen; route: Route; scope: string; limit: number; groups: readonly string[]; tabs: boolean; type: string; dates: string;
    noun: string; layout: "list" | "grid"; map: { tiles: string; credit: string };
};

export default async function Faceted ( props: Props ) {

    const result = await faceted(props);

    if ( result.failed ) return <FailureNotice {...result.failure} />;

    const { failed: _, ...view } = result;

    return <FacetedResults {...view} />;

}
