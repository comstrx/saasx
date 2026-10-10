import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import ArticleCard from "./article-card";
import ArticleLead from "./article-lead";
import Pager from "./pager";
import Section from "./section";
import StateNotice from "./state-notice";

type Item = ComponentProps<typeof ArticleCard> & { key: string; reading: string };
type Props = {
    lead: Item | null; items: readonly Item[]; more: string; art: string;
    empty: { title: string; body: string }; pager: ComponentProps<typeof Pager>;
};

export default function ArticleArchive ({ lead, items, more, art, empty, pager }: Props) {

    if ( !lead && !items.length ) return <StateNotice art={art} title={empty.title} description={empty.body} />;

    return (

        <Stack gap={10}>

            {lead ? (

                <ArticleLead
                    title={lead.title} description={lead.description} image={lead.image}
                    date={lead.date} reading={lead.reading} href={lead.href}
                />

            ) : null}

            {items.length ? (

                <Section title={lead ? more : undefined}>

                    <Grid columns={3} gap={5} label={more}>

                        {items.map(( { key, reading: _reading, ...article } ) => <ArticleCard key={key} {...article} />)}

                    </Grid>

                </Section>

            ) : null}

            {pager.previous || pager.next ? <Pager {...pager} /> : null}

        </Stack>

    );

}
