type Props = { code: string; glyph: boolean; label?: string };

export default function Currency ({ code, glyph, label }: Props) {

    if ( !glyph ) return <span className="font-latin font-semibold tabular-nums">{code}</span>;

    return label ? <span role="img" aria-label={label} className="glyph-sar" /> : <span aria-hidden="true" className="glyph-sar" />;

}
