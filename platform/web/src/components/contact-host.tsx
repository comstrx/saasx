"use client";

import Button from "@/elements/button";
import { useContactHost } from "@/hooks/use-contact-host";
import Icon from "@/icons/icon";

type Props = { productId: number; label: string; failed: string; links: { messages: string; login: string } };

export default function ContactHost ({ productId, label, failed, links }: Props) {

    const host = useContactHost(productId, links, failed);

    return (

        <Button variant="outlined" size="medium" pending={host.pending} onClick={() => { void host.contact(); }}>

            <Icon name="chat" />{label}

        </Button>

    );

}
