
type Unit = [Intl.RelativeTimeFormatUnit, number];

const units: Unit[] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
    ["second", 1_000],
];

export function formatRelative ( iso: string, locale = "en" ): string {

    const time = new Date(iso).getTime();

    if ( Number.isNaN(time) ) return "";

    const delta = time - Date.now();
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    for ( const [unit, ms] of units ) {

        if ( Math.abs(delta) >= ms ) return format.format(Math.round(delta / ms), unit);

    }

    return format.format(0, "second");

}
