import RouteLine from "@/elements/route-line";
import Surface from "@/elements/surface";
import Icon, { isIconName } from "@/icons/icon";

type Stop = { place: string; time?: string | null; detail?: string | null };
type Props = { from: Stop; to: Stop; middle: string; mode: string | null };

const glyphs: Readonly<Record<string, string>> = { train: "train", bus: "bus", flight: "airplane", car: "car", ferry: "compass" };

export default function RouteCard ({ from, to, middle, mode }: Props) {

    const glyph = mode ? glyphs[mode] : undefined;

    return (

        <Surface padding={8} radius="xl">

            <RouteLine from={from} to={to} middle={middle} icon={isIconName(glyph) ? <Icon name={glyph} /> : null} />

        </Surface>

    );

}
