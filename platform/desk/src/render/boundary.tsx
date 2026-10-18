import { defineBoundary } from "engine/screen";
import Notice from "@/elements/notice";
import { reportError } from "@/lib/observe/client";

export const Boundary = defineBoundary<{ message?: string | undefined; retry?: string | undefined }>({
    report: reportError,
    fallback: ({ message, retry, reset }) => {

        if ( !message ) return null;

        return <Notice tone="failed" message={message} action={retry} onAction={reset} />;

    },
});
