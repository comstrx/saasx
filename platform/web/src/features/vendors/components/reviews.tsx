import EntityReviews from "@/components/entity-reviews";
import Section from "@/components/section";
import type { Route } from "@/lib/spec/feature";
import { profile } from "../hooks/use-profile";

type Props = { route: Route };

export default async function Reviews ({ route }: Props) {

    const data = await profile(route);

    if ( !data?.reviews ) return null;

    return (

        <Section id="reviews" title={data.labels.reviews}>

            <EntityReviews source="vendor" id={data.id} empty={data.labels.noReviews} />

        </Section>

    );

}
