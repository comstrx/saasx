import { useTranslation } from "react-i18next";
import { Tabs } from "@/elements/tabs";
import { glyphOf } from "@/features/catalog/marks";
import type { SearchFacets } from "@/model/search";

type SearchKindsProps = {
    kinds: SearchFacets["types"];
    chosen: readonly string[];
    onPick: ( type: string | null ) => void;
};

const every = "all";

export function SearchKinds ({ kinds, chosen, onPick }: SearchKindsProps) {

    const { t } = useTranslation();

    const options = [
        { key: every, label: t("search.all"), icon: "sections" as const },
        ...kinds.map(( kind ) => ({
            key: kind.key,
            label: t(`types.${ kind.key }`, { defaultValue: kind.key.replaceAll("_", " ") }),
            icon: glyphOf(kind.key),
        })),
    ];

    const active = chosen.length === 0 ? every : chosen.length === 1 ? chosen[0] ?? every : "";

    return <Tabs look="track" options={options} active={active} onPick={( key ) => onPick(key === every ? null : key) } />;

}
