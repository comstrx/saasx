import { deviceNote } from "engine/client";
import { interpolate } from "engine/parse";
import { useAction } from "engine/state";
import { formatNumber, type Messages } from "engine/translate";
import { useState } from "react";
import ActionCard from "@/components/action-card";
import { useWrite } from "@/hooks/use-client";
import { useDevice } from "@/hooks/use-device";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = {
    title: string;
    detail: string;
    locate: string;
    saved: string;
    queued: string;
    failed: string;
    denied: string;
    unsupported: string;
    errors: Messages;
};

export default function Locator ({ options, ports }: FeatureProps<Options>) {

    const device = useDevice();
    const locale = useLocale();
    const save = useWrite(ports.save, undefined, { queue: true });
    const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
    const locate = useAction(async () => {

        await device.require("location");

        const found = await device.locate();

        setPosition(found);

        return save.run({ latitude: found.latitude, longitude: found.longitude });

    });
    const coordinate = ( value: number ): string => formatNumber(locale, value, { maximumFractionDigits: 4 });
    const detail = position
        ? interpolate(options.detail, { latitude: coordinate(position.latitude), longitude: coordinate(position.longitude) })
        : undefined;

    return (

        <ActionCard
            icon="pin"
            title={options.title}
            detail={detail}
            note={deviceNote(locate, save, options)}
            action={{
                label: options.locate,
                busy: locate.status === "pending" || save.status === "pending",
                onPress: () => { void locate.run(undefined); },
            }}
        />

    );

}
