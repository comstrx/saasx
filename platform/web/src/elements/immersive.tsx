import type { ReactNode } from "react";

type Props = { media: ReactNode; children: ReactNode };

export default function Immersive ({ media, children }: Props) {

    return (

        <div className="immersive">

            <div className="immersive-media">{media}</div>

            <div className="immersive-sheet">{children}</div>

        </div>

    );

}
