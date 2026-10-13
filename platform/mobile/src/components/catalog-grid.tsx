import Grid from "@/elements/grid";
import Text from "@/elements/text";
import CatalogCard, { type CatalogItem } from "./catalog-card";

type Props = { columns: number; items: readonly CatalogItem[]; empty: string };

export default function CatalogGrid ({ columns, items, empty }: Props) {
    if ( !items.length ) return <Text text={empty} tone="muted" />;

    return <Grid columns={columns} entries={items.map(( item ) => ({ key: item.key, node: <CatalogCard item={item} /> }))} />;
}
