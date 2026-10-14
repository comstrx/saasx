import Badge from "@/elements/badge";
import Card from "@/elements/card";
import Image from "@/elements/image";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useRouter } from "@/hooks/use-router";

export type CatalogItem = { key: string; name: string; image?: string | null | undefined; type?: string | null | undefined; price?: string | undefined; href?: string | undefined };

export default function CatalogCard ({ item }: { item: CatalogItem }) {

    const router = useRouter();
    const { href } = item;

    return (

        <Card onPress={href ? () => router.push(href) : undefined}>

            <Image src={item.image} alt={item.name} />

            <Stack gap={1}>

                {item.type ? <Badge label={item.type} /> : null}

                <Text text={item.name} size="lg" />

                {item.price ? <Text text={item.price} tone="muted" size="sm" /> : null}

            </Stack>

        </Card>

    );

}
