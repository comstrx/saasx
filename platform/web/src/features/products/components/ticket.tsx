import type { ReactNode } from "react";
import AmenityGrid from "@/components/amenity-grid";
import BookingCard from "@/components/booking-card";
import ContentSection from "@/components/content-section";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import DetailHeader from "@/components/detail-header";
import DetailNav from "@/components/detail-nav";
import EventDate from "@/components/event-date";
import FactStrip from "@/components/fact-strip";
import FaqList from "@/components/faq-list";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import PhotoViewer from "@/components/photo-viewer";
import PoiList from "@/components/poi-list";
import ProcessSteps from "@/components/process-steps";
import RulesPanel from "@/components/rules-panel";
import type { DetailData } from "../hooks/use-detail";
import Top from "./top";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode };

export default function Ticket ({ data, reviews, similar }: Props) {

    return (

        <PageFlow gap={10}>

            <Top data={data}>

                <DetailHeader {...data.header} reserve={null} actions={<DetailActions favorite={data.favorite} share={data.share} />} />

                <PhotoViewer {...data.gallery} />

            </Top>

            <FactStrip label={data.highlights.title} items={data.highlights.items} />

            <DetailNav {...data.nav} action={data.header.reserve} />

            <PageSplit
                id="overview"
                sticky
                label={data.bookingLabel}
                end={<BookingCard key={data.booking.initial} {...data.booking} />}
                start={

                    <PageFlow gap={12}>

                        {data.guide ? <ProcessSteps title={data.guide.title} items={data.guide.items} direction="column" /> : null}

                        <ContentSection title={data.overview.title} text={data.overview.text} facts={data.overview.facts} />

                        {data.event ? <EventDate {...data.event} place={data.place?.address} map={data.place?.map} /> : null}

                        <DetailGroups id="details" groups={data.groups} />

                        <AmenityGrid id="facilities" {...data.amenities} />

                    </PageFlow>

                }
            />

            {reviews}

            <PoiList id="location" {...data.nearby} />

            <RulesPanel id="rules" title={data.rules.title} items={data.rules.items} />

            <ContentSection title={data.rules.policies} disclosures={data.rules.disclosures} />

            <FaqList id="faqs" {...data.faqs} />

            {similar}

        </PageFlow>

    );

}
