import Art from "@/elements/art";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Spinner from "@/elements/spinner";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";

type Props = { art: string; title: string; body: string; label: string; href: string };

export default function PromoLanding ({ art, title, body, label, href }: Props) {

    return (

        <Surface padding={10} radius="hero">

            <Stack gap={5} align="center">

                <Art src={art} size="large" motion="float" glow />

                <Stack gap={2} align="center">

                    <Heading level={1} size="h2" align="center">{title}</Heading>

                    <Text tone="muted" align="center" measure="short">{body}</Text>

                </Stack>

                <Spinner size="large" label={label} />

                <Link href={href} variant="outlined" size="medium" shape="pill">{label}</Link>

            </Stack>

        </Surface>

    );

}
