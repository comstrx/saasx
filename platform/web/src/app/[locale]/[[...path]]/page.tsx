import type { Route } from "next";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, Fragment } from "react";
import StructuredData from "@/elements/structured-data";
import { getLocale } from "@/lib/providers/intl-server";
import { pageSeo } from "@/lib/seo";
import { routing } from "@/lib/spec/config";
import { localize, screenAt } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";
import { Screen } from "./screen";

type Query = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<Query>; };

const resolveScreen = cache(async ( path: string ) => {

    const locale = await getLocale();
    const screen = screenAt(path ? path.split("/") : []);

    if ( !screen ) notFound();
    return { screen, locale };

});

function address ( path: string, query: Query ): Route {

    const pairs = Object.entries(query).flatMap(( [key, value] ) => [value ?? []].flat().map(( item ) => [key, item]));
    const search = new URLSearchParams(pairs);

    return (search.size ? `${path}?${search}` : path) as Route;

}
export default async function Page ({ params, searchParams }: Props) {

    const { screen, locale } = await resolveScreen((await params).path?.join("/") ?? "");
    const [query, request, seo] = await Promise.all([searchParams, headers(), pageSeo(screen, locale)]);
    const nonce = request.get("x-nonce") ?? "";

    if ( seo.redirect ) permanentRedirect(address(localePath(locale, seo.redirect, routing), query));

    return (

        <Fragment key={screen.path}>

            <Screen screen={localize({ ...screen, parameters: {} }, locale)} route={{ parameters: screen.parameters, query }} />

            {
                seo.structuredData ? (
                    <StructuredData nonce={nonce} value={seo.structuredData} />
                ) : null
            }

        </Fragment>

    );

}
export async function generateMetadata ({ params }: Props) {

    const { screen, locale } = await resolveScreen((await params).path?.join("/") ?? "");

    return (await pageSeo(screen, locale)).metadata;

}
