import { onlineManager } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { IconName } from "@/elements/icon";
import { useReachable } from "@/query";
import { useLane } from "@/store/lane";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Link = {
    open: boolean;
    label: string;
    tint: ToneName;
    icon: IconName;
};

export function useLink ( watching: boolean ): Link {

    const { t } = useTranslation();
    const theme = useTheme();
    const [ connected, setOnline ] = useState(() => onlineManager.isOnline() );
    const reachable = useReachable();
    const owned = useLane(( state ) => state.owned > 0 );
    const online = !watching || ( connected && reachable );
    const down = !online && !owned;
    const [ said, setSaid ] = useState(false);
    const [ restored, setRestored ] = useState(false);
    const told = useRef(false);

    useEffect(() => onlineManager.subscribe(setOnline), []);

    useEffect(() => {

        if ( !down ) { setSaid(false); return; }

        const hold = setTimeout(() => setSaid(true), theme.beat.rest);

        return () => clearTimeout(hold);

    }, [ down, theme.beat.rest ]);

    useEffect(() => {

        if ( !online ) {

            setRestored(false);

            if ( said || owned ) told.current = true;

            return;

        }

        if ( !told.current ) return;

        told.current = false;
        setRestored(true);

    }, [ online, said, owned ]);

    useEffect(() => {

        if ( !restored ) return;

        const hold = setTimeout(() => setRestored(false), theme.beat.pulse + theme.beat.slow);

        return () => clearTimeout(hold);

    }, [ restored, theme.beat.pulse, theme.beat.slow ]);

    return {
        open: said || restored,
        label: restored ? t("error.restored") : connected ? t("error.unreachable") : t("error.offline"),
        tint: restored ? "success" : "warning",
        icon: restored ? "check" : "wifi",
    };

}
