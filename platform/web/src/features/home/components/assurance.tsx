import AssuranceGrid from "@/components/assurance-grid";
import { assurances } from "../hooks/use-home";

export default async function Assurance ({ title, description }: { title: string; description: string }) {

    return <AssuranceGrid title={title} description={description || undefined} items={await assurances()} />;

}
