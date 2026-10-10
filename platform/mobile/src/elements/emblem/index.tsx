import { type EmblemName, emblems } from "@/brand";
import { frames } from "@/brand/frames";
import { ArtImage } from "@/elements/art-image";

export type { EmblemName };

type EmblemProps = {
    name: EmblemName;
    size: number;
};

export function Emblem ({ name, size }: EmblemProps) {

    return <ArtImage source={emblems[name]} width={size} height={size} frame={frames[name]} fit="contain" transition={0} />;

}
