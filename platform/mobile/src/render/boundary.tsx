import { defineBoundary } from "engine/screen";
import Notice from "@/elements/notice";
import { reportError } from "@/lib/observe/client";
import type { Palette } from "@/styles/theme";

export const Boundary = defineBoundary<{ message?: string | undefined; retry?: string | undefined; palette?: Palette | undefined }>({
    report: reportError,
    fallback: ({ message, retry, palette, reset }) => {

        if ( !message || !palette ) return null;

        return <Notice tone="failed" message={message} action={retry} palette={palette} onAction={reset} />;

    },
});
