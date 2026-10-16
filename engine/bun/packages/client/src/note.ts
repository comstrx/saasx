import { isFailure } from "engine/error";
import type { Action } from "engine/state";
import { failureMessage, type Messages } from "engine/translate";

export type DeviceNote = { text: string; tone: "muted" | "success" | "danger" };
export type DeviceTexts = { saved: string; queued: string; failed: string; denied: string; unsupported: string; errors: Messages };

export function deviceNote (
    ask: Action<unknown>,
    save: Action<unknown> & { queued: boolean },
    texts: DeviceTexts,
): DeviceNote | undefined {

    const refused = ask.status === "failed" && isFailure(ask.error) && ask.error.kind === "denied" ? ask.error : undefined;

    if ( ask.status === "done" && ask.result === "unsupported" ) return { text: texts.unsupported, tone: "muted" };
    if ( ask.status === "done" && save.status === "done" ) return { text: save.queued ? texts.queued : texts.saved, tone: "success" };
    if ( refused ) return { text: refused.reason?.endsWith("unsupported") ? texts.unsupported : texts.denied, tone: "danger" };
    if ( save.status === "failed" ) return { text: failureMessage(save.error, texts.errors, texts.failed), tone: "danger" };
    if ( ask.status === "failed" ) return { text: texts.failed, tone: "danger" };

    return undefined;

}
