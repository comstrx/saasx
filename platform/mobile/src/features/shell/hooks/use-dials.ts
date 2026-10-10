import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { dialsFor } from "@/model/country";
import type { Dial } from "@/std/identity";

export function useDials (): readonly Dial[] {

    const { i18n } = useTranslation();
    const arabic = i18n.language === "ar";

    return useMemo(() => dialsFor(arabic), [ arabic ]);

}
