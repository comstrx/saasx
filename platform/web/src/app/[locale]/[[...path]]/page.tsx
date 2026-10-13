import { notFound } from "next/navigation";
import { cache } from "react";
import { pageMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/site/request";
import type { Locale } from "@/lib/spec/languages";
import { localize, screenAt } from "@/lib/spec/server";
import { Screen } from "./screen";

type Query = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<Query> };

const resolveScreen = cache(async ( path: string ) => {
    const locale = await requestLocale() as Locale;
    const screen = screenAt(path ? path.split("/") : []);

    if ( !screen ) notFound();

    return { screen, locale };
});

export default async function Page ({ params, searchParams }: Props) {
    const { screen, locale } = await resolveScreen((await params).path?.join("/") ?? "");
    const query = await searchParams;

    return <Screen screen={localize({ ...screen, parameters: {} }, locale)} route={{ parameters: screen.parameters, query }} />;
}
export async function generateMetadata ({ params }: Props) {
    const { screen, locale } = await resolveScreen((await params).path?.join("/") ?? "");

    return pageMetadata(screen, locale);
}
