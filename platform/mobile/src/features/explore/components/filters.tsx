import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Band } from "@/components/band";
import { Choice } from "@/components/choice";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Fullscreen } from "@/elements/fullscreen";
import { Link } from "@/elements/link";
import { Range } from "@/elements/range";
import { Switch } from "@/elements/switch";
import { Text } from "@/elements/text";
import { Shell } from "@/elements/well";
import { useMoney } from "@/features/shell/hooks/use-money";
import {
    type SearchFacets,
    type SearchFilters as SearchFilterValue,
    type SearchSupports,
    supportedFor,
} from "@/model/search";
import { toggleMember } from "@/std/array";
import { formatNumber } from "@/std/number";
import { usePrefs } from "@/store/prefs";

type SectionProps = {
    title: string;
    children: ReactNode;
    body?: string | undefined;
};

function Section ({ title, body, children }: SectionProps) {

    return (
        <Box plane="base" depth="lift" curve="card" pad="4">
            <Band title={title} note={body}>{children}</Band>
        </Box>
    );

}

type ToggleProps = {
    label: string;
    body: string;
    on: boolean;
    onChange: ( next: boolean ) => void;
};

function Toggle ({ label, body, on, onChange }: ToggleProps) {

    return (
        <Box row align="center" gap="4" style={styles.toggle}>
            <Box gap="0" style={styles.toggleCopy}>
                <Text rank="body">{label}</Text>
                <Text rank="caption" ink="soft">{body}</Text>
            </Box>

            <Switch on={on} onChange={onChange} label={label} />
        </Box>
    );

}

function Budget ({ label, amount }: { label: string; amount: string }) {

    return (
        <Shell style={styles.budget}>
            <Box gap="1">
                <Text rank="micro" ink="soft">{label}</Text>
                <Text rank="label">{amount}</Text>
            </Box>
        </Shell>
    );

}

type SearchFiltersProps = {
    open: boolean;
    value: SearchFilterValue;
    facets: SearchFacets;
    supports: SearchSupports;
    capabilities: readonly string[];
    total: number | null;
    onChange: ( value: SearchFilterValue ) => void;
    onApply: () => void;
    onReset: () => void;
    onClose: () => void;
};

const ratings = [ 4.5, 4, 3.5 ];
const stars = [ 5, 4, 3 ];
const nights = [ 1, 2, 3, 7 ];
const spans = [ 3, 7, 14 ];

export function SearchFilters ({
    open,
    value,
    facets,
    supports,
    capabilities,
    total,
    onChange,
    onApply,
    onReset,
    onClose,
}: SearchFiltersProps) {

    const { t, i18n } = useTranslation();
    const money = useMoney();
    const currency = usePrefs(( state ) => state.currency );

    const patch = ( change: Partial<SearchFilterValue> ) => onChange({ ...value, ...change });
    const number = ( amount: number, digits = 0 ) => formatNumber(i18n.language, amount, digits);
    const typeLabel = ( key: string ) => t(`types.${ key }`, { defaultValue: key.replaceAll("_", " ") });
    const kindLabel = ( key: string ) => t(`subtypes.${ key }`, { defaultValue: key.replaceAll("_", " ") });

    const action = <Link label={t("search.reset")} rank="caption" onPress={onReset} />;

    const footer = (
        <Button
            label={t("search.showResults", { count: total ?? 0, total: number(total ?? 0) })}
            loading={total === null}
            onPress={onApply}
        />
    );

    return (
        <Fullscreen open={open} title={t("search.filtersTitle")} onClose={onClose} action={action} footer={footer} packed>
            {supportedFor(supports, capabilities, "min_price") && facets.price.max > 0 ? (
                <Section title={t("search.budget")} body={t("search.budgetPerNight")}>
                    <Box align="stretch" row gap="3">
                        <Budget label={t("search.minimum")} amount={money.round(value.minPrice, currency)} />
                        <Budget label={t("search.maximum")} amount={money.round(value.maxPrice ?? facets.price.max, currency)} />
                    </Box>

                    <Range
                        minimum={0}
                        maximum={facets.price.max}
                        low={value.minPrice}
                        high={value.maxPrice ?? facets.price.max}
                        onChange={( minPrice, maxPrice ) =>
                            patch({ minPrice, maxPrice: maxPrice >= facets.price.max ? null : maxPrice }) }
                    />
                </Section>
            ) : null}

            {facets.types.length > 0 ? (
                <Section title={t("search.propertyType")}>
                    <View>{facets.types.map(( option ) => (
                        <Choice
                            key={option.key}
                            label={typeLabel(option.key)}
                            count={option.count}
                            selected={value.types.includes(option.key)}
                            onPress={() => patch({ types: toggleMember(value.types, option.key) })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            {facets.subtypes.length > 0 ? (
                <Section title={t("search.style")} body={t("search.styleBody")}>
                    <View>{facets.subtypes.map(( option ) => (
                        <Choice
                            key={option.key}
                            label={kindLabel(option.key)}
                            count={option.count}
                            selected={value.subtypes.includes(option.key)}
                            onPress={() => patch({ subtypes: toggleMember(value.subtypes, option.key) })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            {supportedFor(supports, capabilities, "min_rating") ? (
                <Section title={t("search.guestRating")} body={t("search.guestRatingBody")}>
                    <View>{ratings.map(( rating ) => (
                        <Choice
                            key={rating}
                            kind="radio"
                            label={t("search.ratingAtLeast", { rating: number(rating, 1) })}
                            selected={value.rating === rating}
                            onPress={() => patch({ rating: value.rating === rating ? null : rating })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            {supportedFor(supports, capabilities, "min_stars") ? (
                <Section title={t("search.stars")} body={t("search.starsBody")}>
                    <View>{stars.map(( count ) => (
                        <Choice
                            key={count}
                            kind="radio"
                            label={t("search.starsAtLeast", { count, value: number(count) })}
                            selected={value.stars === count}
                            onPress={() => patch({ stars: value.stars === count ? null : count })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            {supportedFor(supports, capabilities, "min_nights") ? (
                <Section title={t("search.nights")} body={t("search.nightsBody")}>
                    <View>{nights.map(( count ) => (
                        <Choice
                            key={count}
                            kind="radio"
                            label={t("search.nightsAtLeast", { count, value: number(count) })}
                            selected={value.nights === count}
                            onPress={() => patch({ nights: value.nights === count ? null : count })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            {supportedFor(supports, capabilities, "max_duration") ? (
                <Section title={t("search.span")} body={t("search.spanBody")}>
                    <View>{spans.map(( count ) => (
                        <Choice
                            key={count}
                            kind="radio"
                            label={t("search.spanUpTo", { count, value: number(count) })}
                            selected={value.duration === count}
                            onPress={() => patch({ duration: value.duration === count ? null : count })}
                        />
                    ))}</View>
                </Section>
            ) : null}

            <Section title={t("search.more")}>
                {supportedFor(supports, capabilities, "in_stock") ? (
                    <Toggle
                        label={t("search.inStock")}
                        body={t("search.inStockBody")}
                        on={value.inStock}
                        onChange={( inStock ) => patch({ inStock })}
                    />
                ) : null}

                {supportedFor(supports, capabilities, "featured") ? (
                    <Toggle
                        label={t("search.featured")}
                        body={t("search.featuredBody")}
                        on={value.featured}
                        onChange={( featured ) => patch({ featured })}
                    />
                ) : null}
            </Section>
        </Fullscreen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    budget: {
        flex: 1,
    },
    toggle: {
        minHeight: theme.control.lg.height,
        paddingVertical: theme.space["2"],
    },
    toggleCopy: {
        flex: 1,
    },

}));
