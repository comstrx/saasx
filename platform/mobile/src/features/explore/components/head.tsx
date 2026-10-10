import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { AppBar } from "@/elements/app-bar";
import { Chip } from "@/elements/chip";
import { arrowBack } from "@/elements/icon";
import { useLabels } from "@/elements/labels";
import { Round } from "@/elements/round";
import { Search } from "@/elements/search";
import { SearchHints } from "@/features/explore/components/hints";
import { SearchKinds } from "@/features/explore/components/kinds";
import { retreat } from "@/features/shell/retreat";
import type { SearchFacets, SearchHint, SearchQuery } from "@/model/search";
import { useTheme } from "@/theme/use-theme";

type SearchHeadProps = {
    query: SearchQuery;
    stay: boolean;
    dates: string;
    party: string;
    activeFilters: number;
    hints: readonly SearchHint[];
    kinds: SearchFacets["types"];
    place: string;
    onHint: ( hint: SearchHint ) => void;
    onKind: ( type: string | null ) => void;
    onDates: () => void;
    onParty: () => void;
    onClearPlace: () => void;
    onTermChange: ( value: string ) => void;
    onSubmit: () => void;
    onFilter: () => void;
};

export function SearchHead ({ query, stay, dates, party, activeFilters, hints, kinds, place, onHint, onKind, onDates, onParty, onClearPlace, onTermChange, onSubmit, onFilter }: SearchHeadProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const labels = useLabels();

    const chosen = query.filters.types;
    const rail = [ ...kinds, ...chosen.filter(( type ) => !kinds.some(( kind ) => kind.key === type ) ).map(( key ) => ({ key, count: 0 }) ) ];

    return (
        <AppBar>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"] }}>
                <Round icon={arrowBack} onPress={() => retreat() } label={labels.back} />

                <View style={{ flex: 1 }}>
                    <Search
                        tall
                        value={query.term}
                        onChangeText={onTermChange}
                        placeholder={query.destination || t("search.placeholder")}
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={onSubmit}
                    />
                </View>

                <Round
                    icon="filter"
                    look={activeFilters > 0 ? "soft" : "paper"}
                    tone={activeFilters > 0 ? "brand" : undefined}
                    count={activeFilters || undefined}
                    mark="brand"
                    onPress={onFilter}
                    label={t("search.filters")}
                />
            </View>

            {stay ? (
                <View style={{ flexDirection: "row", gap: theme.space["2"] }}>
                    <Chip block icon="calendar" label={dates || t("search.addDates")} onPress={onDates} />
                    <Chip block icon="users" label={party} onPress={onParty} />
                </View>
            ) : null}

            {place ? (
                <View style={{ alignItems: "flex-start" }}>
                    <Chip live icon="location" trailing="close" label={place} onPress={onClearPlace} />
                </View>
            ) : null}

            <SearchHints items={hints} onPick={onHint} />

            {rail.length > 1 || chosen.length > 0 ? <SearchKinds kinds={rail} chosen={chosen} onPick={onKind} /> : null}
        </AppBar>
    );

}
