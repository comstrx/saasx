import { useQuery } from "@tanstack/react-query";
import { offers } from "@/api/endpoints/offers";
import { offerOf } from "@/model/offer";
import { useCurrency } from "@/query/wire";

const offerKeys = {
    feed: ( limit: number, currency: string ) => [ "offers", limit, currency ] as const,
};

export function useOffers ( limit = 6 ) {

    const currency = useCurrency();

    return useQuery({
        queryKey: offerKeys.feed(limit, currency),
        queryFn: async () => ( await offers.feed(limit) ).map(offerOf),
    });

}
