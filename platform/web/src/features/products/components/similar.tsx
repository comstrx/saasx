import FailureNotice from "@/components/failure-notice";
import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { similar } from "../hooks/use-similar";

export default async function Similar ({ productId, title }: { productId: number; title: string }) {

    const result = await similar(productId);

    if ( result.failed ) return <FailureNotice {...result.failure} />;
    if ( !result.items.length ) return null;

    return <Section title={title}><ProductGrid items={result.items} label={title} /></Section>;

}
