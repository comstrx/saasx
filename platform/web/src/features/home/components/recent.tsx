import EmptyResults from "@/components/empty-results";
import FailureNotice from "@/components/failure-notice";
import ProductRail from "@/components/product-rail";
import Section from "@/components/section";
import { recent } from "../hooks/use-home";

type Props = { title: string; description: string; limit: number };

export default async function Recent ({ title, description, limit }: Props) {

    const result = await recent(limit);

    if ( result.failed ) return <Section title={title}><FailureNotice {...result.failure} /></Section>;
    if ( !result.items.length ) return <Section title={title}><EmptyResults {...result.empty} /></Section>;

    return <ProductRail title={title} description={description || undefined} action={result.action} items={result.items} />;

}
