import { choose } from "engine/base";
import { notFound } from "next/navigation";
import { cache } from "react";
import { pageMetadata } from "@/lib/seo";
import { delivery, routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { localize, screenAt, screens } from "@/lib/spec/server";
import { Screen } from "./screen";

type Query = Record<string, string | string[] | undefined>;
type Params = { locale: string; path?: string[] };
type Props = { params: Promise<Params>; searchParams: Promise<Query> };

const resolveScreen = cache(( given: string, path: string ) => {

    const locale = choose(routing.locales, given, routing.defaultLocale) as Locale;
    const screen = screenAt(path ? path.split("/") : []);

    if ( !screen ) notFound();

    return { screen, locale };

});

function staticParams (): Params[] {

    return routing.locales.flatMap(( locale ) => screens.map(( screen ) => ({ locale, path: screen.path.split("/").filter(Boolean) })));

}
export const generateStaticParams = (delivery === "static" ? staticParams : undefined) as typeof staticParams;

export default async function Page ({ params, searchParams }: Props) {

    const { locale: given, path } = await params;
    const { screen, locale } = resolveScreen(given, path?.join("/") ?? "");
    const query = delivery === "static" ? {} : await searchParams;

    return <Screen screen={localize({ ...screen, parameters: {} }, locale)} locale={locale} route={{ parameters: screen.parameters, query }} />;

}
export async function generateMetadata ({ params }: Props) {

    const { locale: given, path } = await params;
    const { screen, locale } = resolveScreen(given, path?.join("/") ?? "");

    return pageMetadata(screen, locale);

}
