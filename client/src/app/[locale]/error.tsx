"use client";

import { ErrorState } from "@/components/layout/error";

export default function ErrorPage ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {

    return <ErrorState digest={error.digest} reset={reset} />;

}
