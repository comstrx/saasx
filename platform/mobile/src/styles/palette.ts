import { useTheme } from "@/hooks/use-locale";
import { type Palette, palette } from "@/styles/theme";

export function usePalette (): Palette {

    return palette(useTheme());

}
