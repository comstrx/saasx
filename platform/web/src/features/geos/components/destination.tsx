import CategoryGrid from "@/components/category-grid";
import ContentSection from "@/components/content-section";
import EntityActions from "@/components/entity-actions";
import EntityHero from "@/components/entity-hero";
import EntityReviews from "@/components/entity-reviews";
import PageFlow from "@/components/page-flow";
import PhotoViewer from "@/components/photo-viewer";
import Section from "@/components/section";
import StatGrid from "@/components/stat-grid";
import VerticalGrid from "@/components/vertical-grid";
import type { Route } from "@/lib/spec/feature";
import { destination } from "../hooks/use-destinations";

type Props = { route: Route };

export default async function Destination ({ route }: Props) {

    const data = await destination(route);

    if ( !data ) return null;

    return (

        <PageFlow gap={12}>

            <EntityHero title={data.name} trail={data.trail} art={data.art} kind={data.kind} facts={data.facts}>

                <EntityActions feature="geos" id={data.id} name={data.name} login="/login" />

            </EntityHero>

            <StatGrid {...data.stats} />

            {data.pictures.length >= 3 ? (

                <PhotoViewer pictures={data.pictures} labels={data.labels.gallery} direction={data.direction} />

            ) : null}

            {data.about ? <ContentSection title={data.labels.about} text={data.about} /> : null}

            {data.verticals.length ? <VerticalGrid title={data.labels.verticals} items={data.verticals} /> : null}

            {data.categories.length ? <CategoryGrid title={data.labels.categories} items={data.categories} /> : null}

            {data.regions.length ? <CategoryGrid title={data.labels.regions} items={data.regions} /> : null}

            {data.places.length ? <CategoryGrid title={data.labels.places} items={data.places} /> : null}

            {data.attractions.length ? <CategoryGrid title={data.labels.around} items={data.attractions} /> : null}

            {data.reviews ? (

                <Section id="reviews" title={data.labels.reviews}>

                    <EntityReviews source={data.reviews} id={data.id} empty={data.labels.noReviews} />

                </Section>

            ) : null}

        </PageFlow>

    );

}
