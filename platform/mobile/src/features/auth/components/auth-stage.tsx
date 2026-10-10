import { type ArtName, authentication } from "@/brand/assets";
import { Stage } from "@/elements/stage";
import { useSceneActive } from "@/features/shell/hooks/use-scene-active";

type AuthStageProps = { figure: ArtName; size?: number | undefined };

export function AuthStage ({ figure, size }: AuthStageProps) {

    const active = useSceneActive();

    return <Stage figure={authentication[figure] ?? figure} size={size} active={active} />;

}
