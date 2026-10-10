import { useEffect, useState } from "react";
import { Toast } from "@/elements/toast";
import { useLink } from "@/features/boot/connection";
import { useLane } from "@/store/lane";
import { type Notice, type NoticeTone, useNotice } from "@/store/notice";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

const tints: Record<NoticeTone, ToneName> = {
    plain: "neutral",
    info: "info",
    success: "success",
    warning: "warning",
    danger: "danger",
    delight: "accent",
};

export function Notices ({ watching }: { watching: boolean }) {

    const theme = useTheme();
    const link = useLink(watching);
    const current = useNotice(( state ) => state.current );
    const clear = useNotice(( state ) => state.clear );
    const [ held, setHeld ] = useState<Notice | null>(current);

    useEffect(() => {

        if ( current ) setHeld(current);

    }, [ current ]);

    useEffect(() => useLane.getState().hold(link.open), [ link.open ]);

    return (
        <>
            <Toast open={link.open} body={link.label} tint={link.tint} icon={link.icon} linger={0} />
            <Toast key={held?.id ?? 0} open={Boolean(current)} body={held?.message ?? ""} tint={tints[held?.tone ?? "danger"]} lift={link.open ? theme.layout.lane + theme.space["3"] : 0} onClose={clear} />
        </>
    );

}
