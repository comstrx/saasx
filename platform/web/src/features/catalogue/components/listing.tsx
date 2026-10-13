import { field, rows } from "@engine/spec";
import { formatMoney } from "@engine/translate";
import { portOf } from "@/api/workflow/ports";
import type { CatalogItem } from "@/components/catalog-card";
import CatalogGrid from "@/components/catalog-grid";
import Titled from "@/components/titled";
import { requestLocale } from "@/lib/site/request";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; empty: string; from: string; columns: number };

function price ( item: Record<string, unknown>, from: string, locale: string ): string | undefined {

    const amount = Number(field(item, "sale_price.amount") ?? field(item, "min_price.amount"));
    const currency = field(item, "sale_price.currency") ?? field(item, "min_price.currency");

    return amount > 0 && currency ? `${from} ${formatMoney(locale, amount, currency).text}` : undefined;

}
export default async function Listing ({ options, ports, route, feature }: FeatureProps<Options>) {

    const locale = await requestLocale();

    const items: CatalogItem[] = rows(await portOf(ports, "items", route)).map(( item, index ) => ({
        key: field(item, "id") ?? String(index),
        name: field(item, "name") ?? "",
        image: field(item, "image"),
        type: field(item, "type"),
        price: price(item, options.from, locale),
        href: `/${locale}/catalog/${field(item, "id") ?? ""}`,
    }));

    return (

        <Titled id={feature?.slug ?? "catalogue"} title={options.title} primary={feature?.heading ?? false}>

            <CatalogGrid columns={options.columns} items={items} empty={options.empty} />

        </Titled>

    );

}
