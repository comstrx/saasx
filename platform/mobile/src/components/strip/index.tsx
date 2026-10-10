import type { ReactNode } from "react";
import type { Step } from "@/elements/box";
import { Scroll } from "@/elements/scroll";
import { useTheme } from "@/theme/use-theme";

type StripProps = {
    children: ReactNode;
    gap?: Step | undefined;
};

export function Strip ({ children, gap = "4" }: StripProps) {

    const theme = useTheme();

    return (
        <Scroll
            horizontal
            decelerationRate="fast"
            style={{ marginVertical: -theme.space["3"] }}
            contentContainerStyle={{
                gap: theme.space[gap],
                paddingVertical: theme.space["3"],
            }}
        >
            {children}
        </Scroll>
    );

}
