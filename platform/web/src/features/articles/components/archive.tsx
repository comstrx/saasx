import ArticleArchive from "@/components/article-archive";
import type { Route, Screen } from "@/lib/spec/feature";
import { archive } from "../hooks/use-archive";

type Props = { screen: Screen; route: Route };

export default async function Archive ({ screen, route }: Props) {

    const data = await archive(screen, route);

    if ( !data ) return null;

    return <ArticleArchive {...data} art="/assets/images/brand/document.webp" />;

}
