import { type ArtName, art, type BannerName, banners } from "@/brand";
import { frames } from "@/brand/frames";
import { ArtImage } from "@/elements/art-image";
import { useTheme } from "@/theme/use-theme";

export type Artwork = ArtName | BannerName;

const artwork = { ...art, ...banners };

type ArtProps = {
    name: Artwork;
    size: number;
    fit?: "contain" | "fill" | undefined;
};

export function Art ({ name, size, fit = "contain" }: ArtProps) {

    const theme = useTheme();

    return <ArtImage source={artwork[name][theme.name]} width={size} height={size} frame={frames[name]} fit={fit} transition={theme.beat.quick} />;

}
