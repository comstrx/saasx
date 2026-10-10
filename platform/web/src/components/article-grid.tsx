import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import ArticleCard from "./article-card";
import Section from "./section";

type Props = {
    title: string;
    description?: string;
    items: readonly (ComponentProps<typeof ArticleCard> & { key: string })[];
    action?: { href: string; label: string };
};

export default function ArticleGrid ({ title, description, items, action }: Props) {

    return (

        <Section title={title} description={description} action={action}>

            <Grid columns={items.length === 2 ? 2 : 3} gap={5} label={title}>

                {items.map(( { key, ...article } ) => <ArticleCard key={key} {...article} />)}

            </Grid>

        </Section>

    );

}
