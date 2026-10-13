import { useAction } from "@engine/context";
import { isFailure } from "@engine/error";
import { failureMessages, type Messages } from "@engine/translate";
import ActionCard, { type Note } from "@/components/action-card";
import { useDevice } from "@/hooks/use-device";
import { useLocale } from "@/hooks/use-locale";
import { useWrite } from "@/hooks/use-write";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; detail: string; enable: string; saved: string; queued: string; failed: string; denied: string; unsupported: string; errors: Messages };

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
    const noteOf = (): Note | undefined => {
        if ( enroll.status === "done" && enroll.result === "unsupported" ) return { text: options.unsupported, tone: "muted" };
        if ( enroll.status === "done" && save.status === "done" ) return { text: save.queued ? options.queued : options.saved, tone: "success" };
        if ( enroll.status === "failed" && isFailure(enroll.error) && enroll.error.kind === "denied" ) return { text: enroll.error.reason?.endsWith("unsupported") ? options.unsupported : options.denied, tone: "danger" };
        if ( save.status === "failed" ) return { text: Object.values(failureMessages(save.error, options.errors, options.failed))[0] ?? options.failed, tone: "danger" };
        if ( enroll.status === "failed" ) return { text: options.failed, tone: "danger" };

        return undefined;
    };

    return (

        <ActionCard
            icon="bell"
            title={options.title}
            detail={options.detail}
            note={noteOf()}
            action={{ label: options.enable, busy: enroll.status === "pending" || save.status === "pending", onPress: () => { void enroll.run(undefined); } }}
        />

    );
}
