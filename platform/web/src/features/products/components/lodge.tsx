import type { ReactNode } from "react";
import AmenityGrid from "@/components/amenity-grid";
import AmenityStrip from "@/components/amenity-strip";
import BookingCard from "@/components/booking-card";
import ContentSection from "@/components/content-section";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import DetailHeader from "@/components/detail-header";
import DetailNav from "@/components/detail-nav";
import FaqList from "@/components/faq-list";
import HighlightsPanel from "@/components/highlights-panel";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import PhotoViewer from "@/components/photo-viewer";
import PoiList from "@/components/poi-list";
import RoomTable from "@/components/room-table";
import RulesPanel from "@/components/rules-panel";
import ScorePanel from "@/components/score-panel";
import Section from "@/components/section";
import type { DetailData } from "../hooks/use-detail";
import Top from "./top";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode };

export default function Lodge ({ data, reviews, similar }: Props) {

    return (

        <PageFlow gap={10}>

            <Top data={data}>

                <DetailHeader {...data.header} actions={<DetailActions favorite={data.favorite} share={data.share} />} />

                <PageSplit
                    ratio="3:1"
                    start={<PhotoViewer {...data.gallery} />}
                    end={<ScorePanel score={data.score} empty={data.reviewsTitle} reviews={data.header.reviews} place={data.place} />}
                />

            </Top>

            <DetailNav {...data.nav} action={data.header.reserve} />

            <PageSplit
                id="overview"
                start={(

                    <PageFlow gap={8}>

                        <ContentSection title={data.overview.title} text={data.overview.text} facts={data.overview.facts} />

                        <AmenityStrip title={data.popularTitle} items={data.amenities.items} />

                    </PageFlow>

                )}
                end={<HighlightsPanel {...data.highlights} action={data.header.reserve} />}
            />

            {data.rooms.rooms.length ? (

                <Section id="availability" title={data.availabilityTitle}>

                    <PageFlow gap={5}>

                        <BookingCard key={data.booking.initial} {...data.booking} layout="strip" />

                        <RoomTable {...data.rooms} />

                    </PageFlow>

                </Section>

            ) : null}

            <AmenityGrid id="facilities" {...data.amenities} />

            <DetailGroups id="details" groups={data.groups} />

            <RulesPanel id="rules" title={data.rules.title} items={data.rules.items} />

            <ContentSection title={data.rules.policies} disclosures={data.rules.disclosures} />

            <PoiList id="location" {...data.nearby} />

            {reviews}

            <FaqList id="faqs" {...data.faqs} />

            {similar}

        </PageFlow>

    );

}
