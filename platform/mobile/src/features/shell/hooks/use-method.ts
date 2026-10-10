import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRails } from "@/query/wallet";
import { useSession } from "@/store/session";

export function useMethod () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const rails = useRails(Boolean(token)).data;

    return useCallback(
        ( key: string ): string => rails?.find(( rail ) => rail.key === key )?.name || t([ `payments.${ key }`, `wallet.rail.${ key }` ], { defaultValue: key }),
        [ rails, t ],
    );

}
