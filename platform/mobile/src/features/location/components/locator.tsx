
import { useAction } from "@engine/context";
import { isFailure } from "@engine/error";
import { interpolate } from "@engine/parse";
import { formatNumber } from "@engine/translate";
import { useState } from "react";
import ActionCard, { type Note } from "@/components/action-card";
import { useDevice } from "@/hooks/use-device";
import { useLocale } from "@/hooks/use-locale";
import { useWrite } from "@/hooks/use-write";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; detail: string; locate: string; saved: string; failed: string; denied: string; unsupported: string };

export default function Locator ({ options, ports }: FeatureProps<Options>) {

    const device = useDevice();
    const locale = useLocale();
    const save = useWrite(ports.save);
    const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
    const locate = useAction(async () => {

        await device.require("location");

        const found = await device.locate();

        setPosition(found);

        return save.run({ latitude: found.latitude, longitude: found.longitude });

    });
    const noteOf = (): Note | undefined => {

        if ( locate.status === "done" && save.status === "done" ) return { text: options.saved, tone: "success" };
        if ( locate.status === "failed" && isFailure(locate.error) && locate.error.kind === "denied" ) return { text: locate.error.reason?.endsWith("unsupported") ? options.unsupported : options.denied, tone: "danger" };
        if ( locate.status === "failed" || save.status === "failed" ) return { text: options.failed, tone: "danger" };

        return undefined;

    };
    const detail = position ? interpolate(options.detail, { latitude: formatNumber(locale, position.latitude, { maximumFractionDigits: 4 }), longitude: formatNumber(locale, position.longitude, { maximumFractionDigits: 4 }) }) : undefined;

    return (

        <ActionCard
            icon="pin"
            title={options.title}
            detail={detail}
            note={noteOf()}
            action={{ label: options.locate, busy: locate.status === "pending" || save.status === "pending", onPress: () => { void locate.run(undefined); } }}
        />

    );

}
