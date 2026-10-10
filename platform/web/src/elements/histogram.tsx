type Props = { bars: readonly { key: string; count: number }[]; from: number; to: number };

export default function Histogram ({ bars, from, to }: Props) {

    const peak = Math.max(1, ...bars.map(( bar ) => bar.count));

    return (

        <span aria-hidden="true" className="histogram">

            {bars.map(( bar, index ) => (

                <span
                    key={bar.key}
                    data-active={index >= from && index <= to ? "" : undefined}
                    className="histogram-bar"
                    style={{ blockSize: `${bar.count ? Math.max(12, Math.round(Math.sqrt(bar.count / peak) * 100)) : 0}%` }}
                />

            ))}

        </span>

    );

}
