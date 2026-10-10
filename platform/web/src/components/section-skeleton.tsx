import Skeleton from "@/elements/skeleton";
import Stack from "@/elements/stack";

export default function SectionSkeleton () {

    return (

        <Stack gap={4} aria-busy="true">

            <Skeleton shape="title" width="third" />

            <Skeleton width="half" />

            <Skeleton />

        </Stack>

    );

}
