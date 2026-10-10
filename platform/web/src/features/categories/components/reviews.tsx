import EntityReviews from "@/components/entity-reviews";
import Section from "@/components/section";
import type { Route } from "@/lib/spec/feature";
import { categoryReviews } from "../hooks/use-category";

type Props = { route: Route };

export default async function Reviews ({ route }: Props) {

    const data = await categoryReviews(route);

    if ( !data ) return null;

    return (

        <Section id="reviews" title={data.title}>

            <EntityReviews source="category" id={data.id} empty={data.empty} />

        </Section>

    );

}
