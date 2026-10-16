import { field, moneyText, rows } from "engine/client";
import { localePath } from "engine/translate";
import { portOf } from "@/api/workflow/ports";
import type { CatalogItem } from "@/components/catalog-card";
import CatalogGrid from "@/components/catalog-grid";
import Titled from "@/components/titled";
import { requestLocale } from "@/lib/site/request";
import { routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; empty: string; from: string; columns: number };

function price ( item: Record<string, unknown>, from: string, locale: string ): string | undefined {

    const money = moneyText(locale, item, "sale_price", "min_price");

    return money ? `${from} ${money}` : undefined;

}
export default async function Listing ({ options, ports, route, feature }: FeatureProps<Options>) {

    const locale = await requestLocale();

    const items: CatalogItem[] = rows(await portOf(ports, "items", route)).map(( item, index ) => ({
        key: field(item, "id") ?? String(index),
        name: field(item, "name") ?? "",
        image: field(item, "image"),
        type: field(item, "type"),
        price: price(item, options.from, locale),
        href: localePath(locale, `/catalog/${field(item, "id") ?? ""}`, routing),
    }));

    return (

        <Titled id={feature?.slug ?? "catalogue"} title={options.title} primary={feature?.heading ?? false}>

            <CatalogGrid columns={options.columns} items={items} empty={options.empty} />

        </Titled>

    );

}
