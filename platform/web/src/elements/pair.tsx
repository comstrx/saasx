import type { ReactNode } from "react";

type Props = { start: ReactNode; end: ReactNode };

export default function Pair ({ start, end }: Props) {

    return (

        <span className="picker-pair">

            <span className="picker-pair-cell">{start}</span>

            <span className="picker-pair-cell">{end}</span>

        </span>

    );

}
