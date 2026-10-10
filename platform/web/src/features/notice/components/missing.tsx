import MissingPage from "@/components/missing-page";
import { missing } from "../hooks/use-notice";

type Props = { art: string; links: readonly string[] };

export default async function Missing ({ art, links }: Props) {

    return <MissingPage art={art} {...await missing(links)} />;

}
