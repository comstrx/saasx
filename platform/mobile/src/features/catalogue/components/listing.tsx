import { field, rows } from "@engine/spec";
import { formatMoney } from "@engine/translate";
import type { CatalogItem } from "@/components/catalog-card";
import CatalogGrid from "@/components/catalog-grid";
import Note from "@/components/note";
import Status from "@/components/status";
import Titled from "@/components/titled";
import { usePort } from "@/hooks/use-client";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; empty: string; from: string; columns: number; loading: string; failed: string; offline: string; cached: string };

function price ( item: Record<string, unknown>, from: string, locale: string ): string | undefined {

    const amount = Number(field(item, "sale_price.amount") ?? field(item, "min_price.amount"));
    const currency = field(item, "sale_price.currency") ?? field(item, "min_price.currency");

    return amount > 0 && currency ? `${from} ${formatMoney(locale, amount, currency).text}` : undefined;

}
export default function Listing ({ options, ports, route, feature }: FeatureProps<Options>) {

    const locale = useLocale();
    const port = usePort(ports.items, route);
    const items: CatalogItem[] = port.status === "ready" ? rows(port.value).map(( item, index ) => ({
        key: field(item, "id") ?? String(index),
        name: field(item, "name") ?? "",
        image: field(item, "image"),
        type: field(item, "type"),
        price: price(item, options.from, locale),
        href: `/catalog/${field(item, "id") ?? ""}`,
    })) : [];

    return (

        <Titled id={feature?.slug ?? "catalogue"} title={options.title} primary={feature?.heading ?? false}>

            {port.status === "ready" && port.error !== undefined ? <Note text={options.cached} /> : null}

            {port.status === "ready" ? <CatalogGrid columns={options.columns} items={items} empty={options.empty} /> : <Status status={port.status} loading={options.loading} failed={options.failed} offline={options.offline} error={port.status === "failed" ? port.error : undefined} />}

        </Titled>

    );

}
