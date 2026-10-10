import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/theme/use-theme";

export type BrandName = "google" | "facebook" | "apple";

type BrandmarkProps = {
    name: BrandName;
    size?: number;
};

const google = [
    { d: "M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.86Z", fill: "#4285f4" },
    { d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z", fill: "#34a853" },
    { d: "M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z", fill: "#fbbc05" },
    { d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z", fill: "#ea4335" },
];

const facebook = [
    { d: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z", fill: "#1877f2" },
];

const apple = [
    { d: "M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z", fill: null },
];

const marks: Record<BrandName, readonly { d: string; fill: string | null }[]> = { google, facebook, apple };

const zoom: Record<BrandName, number> = { google: 1, facebook: 1, apple: 1.16 };

export function Brandmark ({ name, size = 18 }: BrandmarkProps) {

    const theme = useTheme();

    const side = Math.round(size * zoom[name]);

    return (
        <Svg width={side} height={side} viewBox="0 0 24 24">
            {marks[name].map(( part ) => (
                <Path key={part.d} d={part.d} fill={part.fill ?? theme.ink.base} />
            ))}
        </Svg>
    );

}
