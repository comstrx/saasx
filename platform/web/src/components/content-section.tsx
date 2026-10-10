import Accordion from "@/elements/accordion";
import RichText from "@/elements/rich-text";
import Stack from "@/elements/stack";
import FactList from "./fact-list";
import Section from "./section";

type Props = {
    id?: string;
    title: string;
    text?: string | null;
    limit?: number;
    compact?: boolean;
    more?: string;
    facts?: readonly { key: string; term: string; detail?: string; icon?: string }[];
    disclosures?: readonly { key: string; title: string; body: string }[];
};

export default function ContentSection ({ id, title, text, facts, disclosures, limit, more, compact }: Props) {

    if ( !text && !facts?.length && !disclosures?.length ) return null;

    return (

        <Section id={id} title={title}>

            <Stack gap={6}>

                {text ? <RichText value={text} /> : null}

                {facts?.length ? <FactList compact={compact} items={limit ? facts.slice(0, limit) : facts} /> : null}

                {limit && facts && facts.length > limit && more ? (

                    <Accordion items={[{ key: "more", title: more, body: <FactList items={facts.slice(limit)} /> }]} />

                ) : null}

                {disclosures?.length ? (

                    <Accordion look="panel" items={disclosures.map(( row ) => ({ ...row, body: <RichText value={row.body} /> }))} />

                ) : null}

            </Stack>

        </Section>

    );

}
