import VendorGrid from "@/components/vendor-grid";
import { topVendors } from "../hooks/use-vendors";

type Props = { title: string; description: string; limit: number };

export default async function Top ({ title, description, limit }: Props) {

    const vendors = await topVendors(limit);

    if ( !vendors.length ) return null;

    return <VendorGrid title={title} description={description || undefined} items={vendors} />;

}
