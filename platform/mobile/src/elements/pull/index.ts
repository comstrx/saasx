import { useTheme } from "@/theme/use-theme";

export function usePullSkin () {

    const theme = useTheme();

    return {
        tintColor: theme.tone.brand.base,
        colors: [ theme.tone.brand.base, theme.tone.accent.base ],
        progressBackgroundColor: theme.plane.base,
        progressViewOffset: theme.space["2"],
    };

}
