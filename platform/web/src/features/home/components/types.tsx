import VerticalGrid from "@/components/vertical-grid";
import { typeLinks } from "../hooks/use-home";

export default async function Types ({ title, description }: { title: string; description: string }) {

    return <VerticalGrid title={title} description={description || undefined} items={await typeLinks()} />;

}
