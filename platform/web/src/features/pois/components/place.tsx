import CategoryGrid from "@/components/category-grid";
import ContentSection from "@/components/content-section";
import EntityActions from "@/components/entity-actions";
import EntityHero from "@/components/entity-hero";
import EntityReviews from "@/components/entity-reviews";
import MapCard from "@/components/map-card";
import PageFlow from "@/components/page-flow";
import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import type { Route } from "@/lib/spec/feature";
import { place } from "../hooks/use-place";

type Props = { route: Route };

export default async function Place ({ route }: Props) {

    const data = await place(route);

    if ( !data ) return null;

    return (

        <PageFlow gap={12}>

            <EntityHero title={data.title} trail={data.trail} art={data.art} kind={data.kind} location={data.location}>

                <EntityActions feature="pois" id={data.id} name={data.title} login="/login" />

            </EntityHero>

            <MapCard
                title={data.labels.map} place={data.location} kind={data.kind} icon={data.icon} coordinates={data.coordinates}
                href={data.map} open={data.labels.open}
            />

            {data.about ? <ContentSection title={data.labels.about} text={data.about} /> : null}

            {data.products.length ? (

                <Section title={data.labels.products}><ProductGrid items={data.products} label={data.labels.products} /></Section>

            ) : null}

            {data.nearby.length ? (

                <Section
                    title={data.labels.nearby} action={data.nearbyHref ? { href: data.nearbyHref, label: data.labels.all } : undefined}
                >

                    <ProductGrid items={data.nearby} label={data.labels.nearby} />

                </Section>

            ) : null}

            {data.places.length ? <CategoryGrid title={data.labels.places} items={data.places} /> : null}

            {data.reviews ? (

                <Section id="reviews" title={data.labels.reviews}>

                    <EntityReviews source="poi" id={data.id} empty={data.labels.noReviews} />

                </Section>

            ) : null}

        </PageFlow>

    );

}
