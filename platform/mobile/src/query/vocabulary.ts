import { useQuery } from "@tanstack/react-query";
import { vocabulary } from "@/api/endpoints/vocabulary";
import { currenciesOf, localeOf } from "@/model/vocabulary";

const day = 86400000;

const vocabularyKeys = {
    locales: [ "vocabulary", "locales" ] as const,
    currencies: [ "vocabulary", "currencies" ] as const,
};

export function useServedLocales () {

    return useQuery({
        queryKey: vocabularyKeys.locales,
        queryFn: async () => ( await vocabulary.locales() ).map(localeOf),
        staleTime: day,
        gcTime: day * 7,
    });

}

export function useServedCurrencies () {

    return useQuery({
        queryKey: vocabularyKeys.currencies,
        queryFn: async () => currenciesOf(await vocabulary.currencies()),
        staleTime: day,
        gcTime: day * 7,
    });

}
