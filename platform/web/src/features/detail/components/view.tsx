import { field, row } from "engine/client";
import { formatMoney } from "engine/translate";
import { notFound } from "next/navigation";
import { portOf } from "@/api/workflow/ports";
import DetailCard from "@/components/detail-card";
import Titled from "@/components/titled";
import { requestLocale } from "@/lib/site/request";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { from: string; missing: string; back: string };

export default async function View ({ options, ports, route, feature }: FeatureProps<Options>) {

    const locale = await requestLocale();
    const item = row(await portOf(ports, "item", route).catch(() => undefined));

    if ( !item ) notFound();

    const amount = Number(field(item, "sale_price.amount") ?? field(item, "min_price.amount"));
    const currency = field(item, "sale_price.currency") ?? field(item, "min_price.currency");
    const facts = [
        { key: "id", label: "ID", value: field(item, "id") ?? "" },
        { key: "slug", label: "Slug", value: field(item, "slug") ?? "" },
        { key: "rating", label: "Rating", value: field(item, "rating") ?? "" },
    ].filter(( fact ) => fact.value);

    return (

        <Titled id={feature?.slug ?? "detail"} title={field(item, "name") ?? options.missing} primary={feature?.heading ?? false}>

            <DetailCard
                item={{
                    name: field(item, "name") ?? "",
                    image: field(item, "image"),
                    type: field(item, "type"),
                    price: amount > 0 && currency ? `${options.from} ${formatMoney(locale, amount, currency).text}` : undefined,
                    facts,
                }}
                back={{ href: `/${locale}`, label: options.back }}
            />

        </Titled>

    );

}
