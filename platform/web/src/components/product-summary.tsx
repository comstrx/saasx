import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Badge from "@/elements/badge";
import Breadcrumbs from "@/elements/breadcrumbs";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Rating from "@/elements/rating";
import RichText from "@/elements/rich-text";
import SpecList from "@/elements/spec-list";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import type { ProductCardData } from "@/hooks/use-product-card";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    title: string;
    trail: { label: string; items: readonly { label: string; href?: string }[] };
    seller: string | null;
    sellerHref?: string | null;
    rating: { value: string; count: string; label: string } | null;
    reviews?: { href: string; label: string } | null;
    price: ProductCardData["price"];
    discount: string | null;
    currencyLabel: string;
    note: string;
    stock: { tone: "success" | "warning" | "danger"; label: string } | null;
    delivery: string | null;
    specs: readonly { key: string; term: string; detail: string; icon?: string }[];
    about: { title: string; text: string | null };
    actions?: ReactNode;
};

const tones = { success: "positive", warning: "attention", danger: "negative" } as const;

function glyph ( icon?: string ) {

    return isIconName(icon) ? <Icon name={icon} /> : undefined;

}
export default function ProductSummary ({
    title, trail, seller, sellerHref, rating, reviews, price, discount, currencyLabel, note, stock, delivery, specs, about, actions,
}: Props) {

    return (

        <Stack gap={5}>

            <Stack direction="row" align="center" justify="between" gap={3}>

                <Breadcrumbs label={trail.label} items={trail.items} />

                {actions}

            </Stack>

            <Stack gap={2}>

                <Heading level={1} size="h2">{title}</Heading>

                {seller && sellerHref ? <Link href={sellerHref} variant="text">{seller}</Link> : null}

                {seller && !sellerHref ? <Text size="small" tone="muted">{seller}</Text> : null}

                <Stack direction="row" align="center" gap={3} wrap>

                    {rating ? <Rating {...rating} tone="gold" /> : null}

                    {reviews ? <Link href={reviews.href} variant="inline">{reviews.label}</Link> : null}

                </Stack>

            </Stack>

            <Divider />

            {price ? (

                <Stack gap={1}>

                    <Stack direction="row" align="center" gap={3} wrap>

                        {discount ? <Badge tone="ember" size="large">{discount}</Badge> : null}

                        <Amount {...price.now} currencyLabel={currencyLabel} size="hero" />

                        {price.unit ? <Text as="span" size="small" tone="muted">{price.unit}</Text> : null}

                    </Stack>

                    {price.was ? (

                        <Stack direction="row" align="center" gap={2}>

                            <Text as="span" size="small" tone="muted">{price.from}</Text>

                            <Amount {...price.was} currencyLabel={currencyLabel} size="small" strike />

                        </Stack>

                    ) : null}

                    <Text size="label" tone="muted">{note}</Text>

                </Stack>

            ) : null}

            <Stack direction="row" align="center" gap={3} wrap>

                {stock ? <Status tone={tones[stock.tone]} icon={<Icon name="package" size="sm" />}>{stock.label}</Status> : null}

                {delivery ? (

                    <Stack direction="row" align="center" gap={2}>

                        <Icon name="truck" size="md" tone="accent" />

                        <Text as="span" size="small">{delivery}</Text>

                    </Stack>

                ) : null}

            </Stack>

            {specs.length ? <SpecList look="plain" items={specs.map(( row ) => ({ ...row, icon: glyph(row.icon) }))} /> : null}

            {about.text ? (

                <Stack gap={3}>

                    <Heading level={2} size="title">{about.title}</Heading>

                    <RichText value={about.text} />

                </Stack>

            ) : null}

        </Stack>

    );

}
