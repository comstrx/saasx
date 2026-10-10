import type { ReactNode } from "react";
import BookingCard from "@/components/booking-card";
import ContentSection from "@/components/content-section";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import DetailHeader from "@/components/detail-header";
import FactStrip from "@/components/fact-strip";
import FaqList from "@/components/faq-list";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import ProcessSteps from "@/components/process-steps";
import RulesPanel from "@/components/rules-panel";
import type { DetailData } from "../hooks/use-detail";
import Top from "./top";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode; steps: string };

export default function Document ({ data, reviews, similar, steps }: Props) {

    return (

        <PageFlow gap={10}>

            <Top data={data}>

                <DetailHeader {...data.header} reserve={null} actions={<DetailActions favorite={data.favorite} share={data.share} />} />

            </Top>

            <FactStrip label={data.highlights.title} items={data.highlights.items} />

            <PageSplit
                id="overview"
                sticky
                label={data.bookingLabel}
                end={<BookingCard key={data.booking.initial} {...data.booking} />}
                start={

                    <PageFlow gap={12}>

                        <ContentSection title={data.overview.title} text={data.overview.text} facts={data.overview.facts} />

                        {data.document ? <ProcessSteps title={steps} items={data.document.steps} direction="column" /> : null}

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
