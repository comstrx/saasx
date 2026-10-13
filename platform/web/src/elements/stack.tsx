import type { ReactNode } from "react";

type Props = { gap?: 1 | 2 | 3 | 4 | 6 | undefined; direction?: "column" | "row" | undefined; align?: "start" | "center" | "end" | "stretch" | "between" | undefined; children: ReactNode };

export default function Stack ({ gap = 3, direction = "column", align = "stretch", children }: Props) {

    return <div className="stack" data-gap={gap} data-direction={direction} data-align={align}>{children}</div>;

}
