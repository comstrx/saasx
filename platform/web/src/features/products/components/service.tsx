import type { ReactNode } from "react";
import AmenityGrid from "@/components/amenity-grid";
import BookingCard from "@/components/booking-card";
import ContactHost from "@/components/contact-host";
import ContentSection from "@/components/content-section";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import DetailHeader from "@/components/detail-header";
import DetailNav from "@/components/detail-nav";
import FactStrip from "@/components/fact-strip";
import FaqList from "@/components/faq-list";
import HostCard from "@/components/host-card";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import PhotoViewer from "@/components/photo-viewer";
import ProcessSteps from "@/components/process-steps";
import RulesPanel from "@/components/rules-panel";
import type { DetailData } from "../hooks/use-detail";
import Top from "./top";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode; steps: string };

export default function Service ({ data, reviews, similar, steps }: Props) {

    return (

        <PageFlow gap={10}>

            <Top data={data}>

                <DetailHeader
                    {...data.header}
                    reserve={null}
                    badges={data.service ? [{ key: "mode", label: data.service.mode, icon: data.service.online ? "devices" : "pin" }] : []}
                    actions={<DetailActions favorite={data.favorite} share={data.share} />}
                />

                <PhotoViewer {...data.gallery} />

            </Top>

            {data.host ? <HostCard {...data.host} contact={<ContactHost {...data.contact} />} /> : null}

            <DetailNav {...data.nav} action={data.header.reserve} />

            <PageSplit
                id="overview"
                sticky
                label={data.bookingLabel}
                end={<BookingCard key={data.booking.initial} {...data.booking} />}
                start={

                    <PageFlow gap={12}>

                        <FactStrip label={data.highlights.title} items={data.highlights.items} />

                        <ContentSection title={data.overview.title} text={data.overview.text} facts={data.overview.facts} />

                        {data.service ? <ProcessSteps title={steps} items={data.service.steps} direction="column" /> : null}

                        <AmenityGrid id="facilities" {...data.amenities} />

                        <DetailGroups id="details" groups={data.groups} />

                        <RulesPanel id="rules" title={data.rules.title} items={data.rules.items} />

                        <ContentSection title={data.rules.policies} disclosures={data.rules.disclosures} />

                    </PageFlow>

                }
            />

            {reviews}

            <FaqList id="faqs" {...data.faqs} />

            {similar}

        </PageFlow>

    );

}
