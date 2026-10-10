"use client";

import { Check, Info, Warning, X } from "@/lib/providers/icons";
import { Toast } from "@/lib/providers/ui";

type Props = { close: string };

const looks = {
    success: { tone: "ceramic-success", bar: "bg-success", Glyph: Check, weight: "bold" },
    error: { tone: "ceramic-danger", bar: "bg-danger", Glyph: Warning, weight: "fill" },
    warning: { tone: "ceramic-warning", bar: "bg-warning", Glyph: Warning, weight: "fill" },
    info: { tone: "ceramic-teal", bar: "bg-accent", Glyph: Info, weight: "fill" },
} as const;

function lookOf ( type?: string ) {

    return looks[(type ?? "info") as keyof typeof looks] ?? looks.info;

}
export default function Toaster ({ close }: Props) {

    const { toasts } = Toast.useToastManager();

    return (

        <Toast.Portal>

            <Toast.Viewport className="toast-viewport">

                {toasts.map(( toast ) => {

                    const look = lookOf(toast.type);

                    return (

                        <Toast.Root key={toast.id} toast={toast} className="toast-root">

                            <Toast.Content className="toast toast-content">

                                <span aria-hidden="true" className={`toast-pebble ${look.tone}`}>

                                    <look.Glyph weight={look.weight} />

                                </span>

                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">

                                    <Toast.Title className="text-value font-semibold text-ink" />

                                    <Toast.Description className="text-small text-muted" />

                                </div>

                                {toast.actionProps ? <Toast.Action className="toast-action" /> : null}

                                <Toast.Close aria-label={close} className="btn btn-ghost btn-sm btn-icon btn-pill shrink-0 text-ink">

                                    <X weight="bold" />

                                </Toast.Close>

                                <span
                                    aria-hidden="true"
                                    data-timed={toast.timeout ? "" : undefined}
                                    className={`toast-timer ${look.bar}`}
                                    style={toast.timeout ? { animationDuration: `${toast.timeout}ms` } : undefined}
                                />

                            </Toast.Content>

                        </Toast.Root>

                    );

                })}

            </Toast.Viewport>

        </Toast.Portal>

    );

}
