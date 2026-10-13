import Illustration, { type Scene } from "@/elements/illustration";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { scene: Scene; text: string; tone?: "muted" | "danger" | undefined };

export default function SceneNote ({ scene, text, tone = "muted" }: Props) {

    return (

        <Stack gap={2} align="center">

            <Illustration scene={scene} />

            <Text text={text} tone={tone} size="sm" />

        </Stack>

    );

}
