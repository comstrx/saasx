import FailureNotice from "@/components/failure-notice";
import { getTranslations } from "@/lib/providers/intl-server";
import type { Route, Screen } from "@/lib/spec/feature";
import { detail } from "../hooks/use-detail";
import Document from "./document";
import Event from "./event";
import Experience from "./experience";
import Goods from "./goods";
import Insurance from "./insurance";
import Lodge from "./lodge";
import Reviews from "./reviews";
import Room from "./room";
import Service from "./service";
import Similar from "./similar";
import Stay from "./stay";
import Ticket from "./ticket";
import Transport from "./transport";

type Props = { screen: Screen; route: Route; atlas: { tiles: string; credit: string } };

export default async function Detail ( props: Props ) {

    const [result, t, listing] = await Promise.all([detail(props), getTranslations("detail"), getTranslations("listing")]);

    if ( result.failed ) return <FailureNotice level={1} {...result.failure} />;

    const reviews = (
        <Reviews
            productId={result.id} title={result.reviewsTitle} page={result.reviewPage} path={result.path} route={props.route}
            score={result.score} rating={result.rating} stars={result.starsLabel}
        />
    );
    const similar = <Similar productId={result.id} title={result.similarTitle} />;
    const parts = { data: result, reviews, similar };

    if ( result.family === "lodge" ) return <Lodge {...parts} />;
    if ( result.family === "room" ) return <Room {...parts} />;
    if ( result.family === "stay" ) return <Stay {...parts} />;
    if ( result.family === "transport" ) return <Transport {...parts} />;
    if ( result.family === "service" ) return <Service {...parts} steps={t("howItWorks")} />;
    if ( result.family === "document" ) return <Document {...parts} steps={t("howToApply")} />;
    if ( result.family === "goods" ) return <Goods {...parts} note={listing("allIn")} />;
    if ( result.family === "event" ) return <Event {...parts} />;
    if ( result.family === "ticket" ) return <Ticket {...parts} />;
    if ( result.family === "insurance" ) return <Insurance {...parts} />;

    return <Experience {...parts} />;

}
