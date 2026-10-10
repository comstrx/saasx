import Stack from "@/elements/stack";
import NavigationLinks from "./navigation-links";
import SortMenu from "./sort-menu";

type Props = {
    groups: readonly { href: string; label: string; current: boolean }[];
    sort: { label: string; choices: readonly { key: string; label: string; href: string; current: boolean }[] };
};

export default function CollectionControls ({ groups, sort }: Props) {

    return (

        <Stack direction="row" gap={3} align="center" justify="between" wrap>

            <Stack direction="row" gap={1} wrap><NavigationLinks items={groups} /></Stack>
            <SortMenu {...sort} />

        </Stack>

    );

}
