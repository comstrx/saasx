import { deviceNote } from "engine/client";
import { useAction } from "engine/state";
import type { Messages } from "engine/translate";
import ActionCard from "@/components/action-card";
import { useWrite } from "@/hooks/use-client";
import { useDevice } from "@/hooks/use-device";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = {
    title: string;
    detail: string;
    enable: string;
    saved: string;
    queued: string;
    failed: string;
    denied: string;
    unsupported: string;
    errors: Messages;
};

export default function Enroll ({ options, ports }: FeatureProps<Options>) {

    const device = useDevice();
    const locale = useLocale();
    const save = useWrite(ports.save, undefined, { queue: true });
    const enroll = useAction(async () => {

        await device.require("notifications");

        const token = await device.pushToken();

        if ( !token ) return "unsupported" as const;

        const platform = device.info().platform;

        return save.run({ token, platform: platform === "unknown" ? "web" : platform, locale });

    });

    return (

        <ActionCard
            icon="bell"
            title={options.title}
            detail={options.detail}
            note={deviceNote(enroll, save, options)}
            action={{
                label: options.enable,
                busy: enroll.status === "pending" || save.status === "pending",
                onPress: () => { void enroll.run(undefined); },
            }}
        />

    );

}
