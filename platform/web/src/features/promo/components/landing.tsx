"use client";

import PromoLanding from "@/components/promo-landing";
import { usePromoLanding } from "../hooks/use-landing";

type Props = { parameters: Readonly<Record<string, string | undefined>>; art: string; home: string };

export default function Landing ({ parameters, art, home }: Props) {

    const landing = usePromoLanding(parameters, home);

    return <PromoLanding art={art} title={landing.title} body={landing.body} label={landing.label} href={landing.href} />;

}
