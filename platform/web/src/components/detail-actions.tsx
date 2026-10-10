import Stack from "@/elements/stack";
import EntityActions from "./entity-actions";
import ProductFavorite from "./product-favorite";
import ShareButton from "./share-button";

type Props = {
    favorite: { productId: number; name: string; signIn: string | null };
    share: { label: string; copied: string; failed: string };
};

export default function DetailActions ({ favorite, share }: Props) {

    return (

        <Stack direction="row" align="center" gap={2}>

            <ShareButton title={favorite.name} labels={share} />

            <ProductFavorite {...favorite} compact />

            <EntityActions feature="products" id={favorite.productId} name={favorite.name} login="/login" verbs={["report"]} compact />

        </Stack>

    );

}
