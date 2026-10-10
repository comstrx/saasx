import ArticleGrid from "@/components/article-grid";
import { latestArticles } from "../hooks/use-articles";

type Props = { title: string; description: string; limit: number };

export default async function Latest ({ title, description, limit }: Props) {

    const articles = await latestArticles(limit);

    if ( !articles?.items.length ) return null;

    return <ArticleGrid title={title} description={description || undefined} {...articles} />;

}
