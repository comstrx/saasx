"use client";

import type { Data } from "@/api/features";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useProductReviews } from "@/hooks/use-product-reviews";
import { useTranslations } from "@/lib/providers/intl";
import FormRetry from "./form-retry";
import ReviewManager from "./review-manager";
import SectionSkeleton from "./section-skeleton";

type Props = { productId: number; page: number; initial?: Data<"products", "reviews">[] };

export default function ProductReviews ({ productId, page, initial }: Props) {

    const state = useProductReviews(productId, page, initial);
    const t = useTranslations("detail");
    const common = useTranslations("common");

    return (

        <Stack gap={4}>

            {state.error ? <FormRetry id={["product-reviews", productId].join("-")}
                message={t("reviewsFailed")} label={common("retry")} onRetry={state.reload}
            /> : state.loading && !state.items.length ? <SectionSkeleton /> : null}
            <ReviewManager items={state.items} scope={["catalog", productId].join(".")} catalogId={productId}
                publication={false} onChanged={state.reload} />
            {!state.loading && !state.error && !state.items.length ? <Text size="small" tone="muted">{t("noReviews")}</Text> : null}

        </Stack>

    );

}
