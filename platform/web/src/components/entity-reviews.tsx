"use client";

import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { type ReviewSource, useEntityReviews } from "@/hooks/use-entity-reviews";
import { useTranslations } from "@/lib/providers/intl";
import FormRetry from "./form-retry";
import ReviewManager from "./review-manager";
import SectionSkeleton from "./section-skeleton";

type Props = { source: ReviewSource; id: number; empty: string };

export default function EntityReviews ({ source, id, empty }: Props) {

    const state = useEntityReviews(source, id);
    const common = useTranslations("common");

    return (

        <Stack gap={4}>

            {state.error ? (

                <FormRetry id={`${source}-reviews-${id}`} message={common("failedBody")} label={common("retry")} onRetry={state.reload} />

            )
                : state.loading && !state.items.length ? <SectionSkeleton /> : null}

            <ReviewManager items={state.items} scope={`${source}.${id}`} publication={false} layout="pairs" onChanged={state.reload} />

            {!state.loading && !state.error && !state.items.length ? <Text size="small" tone="muted">{empty}</Text> : null}

        </Stack>

    );

}
