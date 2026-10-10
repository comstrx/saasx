"use client";

import Button from "@/elements/button";
import Link from "@/elements/link";
import { useRetry } from "@/hooks/use-retry";
import Icon from "@/icons/icon";
import StateNotice from "./state-notice";

type Props = {
    level?: 1 | 2;
    art?: string;
    title: string;
    description: string;
    retry: string;
    support?: { href: string; label: string } | null;
    reference?: { label: string; code: string } | null;
};

export default function FailureNotice ({ level, art, title, description, retry, support, reference }: Props) {

    const request = useRetry();

    return (

        <StateNotice
            level={level}
            art={art}
            kind="error"
            title={title}
            description={description}
            reference={reference}
            action={

                <>

                    <Button pending={request.pending} onClick={request.retry}><Icon name="refresh" />{retry}</Button>

                    {support ? (

                        <Link href={support.href} variant="outlined" size="medium"><Icon name="headset" />{support.label}</Link>

                    ) : null}

                </>

            }
        />

    );

}
