import Pager from "@/components/pager";
import ProductReviews from "@/components/product-reviews";
import ReviewSection from "@/components/review-section";
import ReviewSummary from "@/components/review-summary";
import Section from "@/components/section";
import StateNotice from "@/components/state-notice";
import type { Route } from "@/lib/spec/feature";
import { queryHref } from "@/lib/std/listing";
import { reviews } from "../hooks/use-reviews";

type Score = { value: string; word: string; detail: string; label: string };
type Props = {
    productId: number; page: number; title: string; path: string; route: Route; score: Score | null; rating: number; stars: string;
};

export default async function Reviews ({ productId, page, title, path, route, score, rating, stars }: Props) {

    const result = await reviews(productId, page);
    const href = ( next: number ) => `${queryHref(path, route.query, { reviews: String(next) })}#reviews`;

    if ( !result.failed && !result.items.length && page === 1 ) return (

        <Section id="reviews" title={title}>

            <StateNotice compact art="/assets/images/brand/chat.webp" title={result.labels.empty} description={result.labels.emptyBody} />

        </Section>

    );

    return (

        <ReviewSection
            id="reviews"
            title={title}
            summary={(

                <ReviewSummary
                    title={result.labels.summary}
                    score={score}
                    rating={rating}
                    stars={stars}
                    bars={result.bars}
                    note={result.labels.note}
                    empty={result.labels.empty}
                />

            )}
        >

            <ProductReviews productId={productId} page={page} initial={result.failed ? undefined : result.items} />

            {!result.failed && result.items.length ? (

                <Pager
                    label={result.page}
                    previous={result.previous ? { label: result.previous, href: href(page - 1) } : null}
                    next={result.next ? { label: result.next, href: href(page + 1) } : null}
                />

            ) : null}

        </ReviewSection>

    );

}
