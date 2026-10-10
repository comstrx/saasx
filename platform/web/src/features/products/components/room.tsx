import type { ReactNode } from "react";
import AmenityGrid from "@/components/amenity-grid";
import BookingCard from "@/components/booking-card";
import ContentSection from "@/components/content-section";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import DetailHeader from "@/components/detail-header";
import HighlightsPanel from "@/components/highlights-panel";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import PhotoViewer from "@/components/photo-viewer";
import RulesPanel from "@/components/rules-panel";
import ScorePanel from "@/components/score-panel";
import type { DetailData } from "../hooks/use-detail";
import Top from "./top";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode };

export default function Room ({ data, reviews, similar }: Props) {

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

            <PageSplit
                id="overview"
                sticky
                label={data.bookingLabel}
                end={<BookingCard key={data.booking.initial} {...data.booking} />}
                start={

                    <PageFlow gap={12}>

                        <ContentSection title={data.overview.title} text={data.overview.text} facts={data.overview.facts} />

                        <HighlightsPanel {...data.highlights} />

                        <AmenityGrid id="facilities" {...data.amenities} />

                        <DetailGroups id="details" groups={data.groups} />

                        <RulesPanel id="rules" title={data.rules.title} items={data.rules.items} />

                        <ContentSection title={data.rules.policies} disclosures={data.rules.disclosures} />

                    </PageFlow>

                }
            />

            {reviews}

            {similar}

        </PageFlow>

    );

}
