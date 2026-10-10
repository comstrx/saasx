import { useCallback, useState } from "react";

type Pull = {
    refreshing: boolean;
    onRefresh: () => void;
};

export function usePull ( refetch: () => unknown ): Pull {

    const [ refreshing, setRefreshing ] = useState(false);

    const onRefresh = useCallback(() => {

        setRefreshing(true);

        void Promise.resolve(refetch()).finally(() => setRefreshing(false) );

    }, [ refetch ]);

    return { refreshing, onRefresh };

}
