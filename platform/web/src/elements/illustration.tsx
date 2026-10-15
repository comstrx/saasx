import { iconGlyph } from "engine/world";

export type Scene = "empty" | "failed" | "offline" | "denied" | "done";
type Props = { scene: Scene; label?: string | undefined };

export default function Illustration ({ scene, label }: Props) {

    const glyph = iconGlyph(scene);

    if ( label ) return <span className="illustration" data-scene={scene} role="img" aria-label={label}>{glyph}</span>;

    return <span className="illustration" data-scene={scene} aria-hidden>{glyph}</span>;

}
