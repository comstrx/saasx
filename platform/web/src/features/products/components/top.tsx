import type { ReactNode } from "react";
import DealStrip from "@/components/deal-strip";
import DetailHero from "@/components/detail-hero";
import type { DetailData } from "../hooks/use-detail";

type Props = { data: DetailData; children: ReactNode };

export default function Top ({ data, children }: Props) {

    return (

        <DetailHero {...data.hero} pictures={data.gallery.pictures} favorite={data.favorite} share={data.share}>

            {children}

            {data.deal ? <DealStrip {...data.deal} /> : null}

        </DetailHero>

    );

}
