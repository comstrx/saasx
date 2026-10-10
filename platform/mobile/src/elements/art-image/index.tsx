import { Image, type ImageProps } from "expo-image";
import { View } from "react-native";
import type { ImageFrame } from "@/brand/frames";

type ArtImageProps = {
    source: NonNullable<ImageProps["source"]>;
    width: number;
    height: number;
    frame?: ImageFrame | undefined;
    transition?: number | undefined;
    fit?: "contain" | "fill" | undefined;
};

export function ArtImage ({ source, width, height, frame, transition = 0, fit = "fill" }: ArtImageProps) {

    if ( !frame ) return <Image source={source} style={{ width, height }} contentFit="contain" transition={transition} accessibilityIgnoresInvertColors />;

    const visibleWidth = fit === "contain" ? Math.min(width, height * frame.ratio) : width;
    const visibleHeight = fit === "contain" ? visibleWidth / frame.ratio : height;

    return (
        <View style={{ width, height, overflow: "hidden", direction: "ltr" }}>
            <Image
                source={source}
                style={{
                    position: "absolute",
                    left: ( width - visibleWidth ) / 2 - visibleWidth * frame.left / frame.width,
                    top: ( height - visibleHeight ) / 2 - visibleHeight * frame.top / frame.height,
                    width: visibleWidth / frame.width,
                    height: visibleHeight / frame.height,
                }}
                contentFit="cover"
                transition={transition}
                accessibilityIgnoresInvertColors
            />
        </View>
    );

}
