
import { useAction } from "@engine/context";
import { field, row } from "@engine/spec";
import { failureMessages, type Messages } from "@engine/translate";
import { useState } from "react";
import AvatarCard from "@/components/avatar-card";
import Status from "@/components/status";
import { useDevice } from "@/hooks/use-device";
import { usePort } from "@/hooks/use-port";
import { useWrite } from "@/hooks/use-write";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; pick: string; camera: string; saved: string; failed: string; loading: string; offline: string; cached: string; empty: string; errors: Messages };

export default function Picker ({ options, ports, route, feature }: FeatureProps<Options>) {

    const device = useDevice();
    const me = usePort(ports.me, route);
    const save = useWrite(ports.save);
    const [uploaded, setUploaded] = useState<string | null>(null);
    const pick = useAction(async ( source: "library" | "camera" ) => {

        const image = await device.pick(source);

        if ( !image ) return undefined;

        const answer = await save.run({ image });

        if ( answer ) setUploaded(field(row(answer.resource), "image") ?? null);

        return answer;

    });
    const image = uploaded ?? (me.status === "ready" ? field(row(me.value), "image") : undefined);
    const note = save.status === "done" ? { text: options.saved, tone: "success" as const } : save.status === "failed" ? { text: failureMessages(save.error, options.errors, options.failed)._form ?? failureMessages(save.error, options.errors, options.failed).image ?? options.failed, tone: "danger" as const } : pick.status === "failed" ? { text: options.failed, tone: "danger" as const } : me.status === "ready" && !image ? { text: options.empty, tone: "muted" as const } : undefined;
    const status = me.status === "ready" ? undefined : <Status status={me.status} loading={options.loading} failed={options.failed} offline={options.offline} error={me.status === "failed" ? me.error : undefined} />;

    return (

        <AvatarCard
            title={options.title}
            alt={feature?.slug ?? "avatar"}
            image={image}
            status={status}
            pick={options.pick}
            camera={options.camera}
            busy={pick.status === "pending" || save.status === "pending"}
            note={note}
            onPick={( source ) => { void pick.run(source); }}
        />

    );

}
