import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { unitOf } from "@/model/catalog";

export function useUnit () {

    const { t } = useTranslation();

    return useCallback(( unit?: string | null ): string | undefined => {

        if ( !unitOf(unit) ) return undefined;

        return t(`listing.unit.${ unit }`, { defaultValue: "" }) || undefined;

    }, [ t ]);

}
