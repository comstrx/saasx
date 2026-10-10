import CategoryGrid from "@/components/category-grid";
import { popular } from "../hooks/use-categories";

type Props = { title: string; description: string; limit: number; source: "home" | "list" };

export default async function Popular ({ title, description, limit, source }: Props) {

    const categories = await popular(limit, source);

    if ( !categories?.items.length ) return null;

    return <CategoryGrid title={title} description={description || undefined} {...categories} />;

}
