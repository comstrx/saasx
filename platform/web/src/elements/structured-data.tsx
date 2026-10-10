import { inline, type Json } from "@/lib/std/json";

type Props = { value: Json; nonce: string };

export default function StructuredData ({ value, nonce }: Props) {

    return <script nonce={nonce} type="application/ld+json">{inline(value)}</script>;

}
