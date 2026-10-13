"use client";

import Notice from "@/elements/notice";

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function Failure ({ error, reset }: Props) {
    return <Notice tone="failed" message={error.digest ?? error.name} action="↻" onAction={reset} digest={error.digest} />;
}
