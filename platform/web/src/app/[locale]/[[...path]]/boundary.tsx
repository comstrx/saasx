"use client";

import { defineBoundary } from "engine/screen";
import Notice from "@/elements/notice";
import { reportError } from "@/lib/observe/browser";

export const Boundary = defineBoundary<{ message?: string | undefined; retry?: string | undefined }>({
    report: reportError,
    fallback: ({ message, retry, reset }) => (message ? <Notice tone="failed" message={message} action={retry} onAction={reset} /> : null),
});
