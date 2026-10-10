export type Agent = { browser: string; system: string; kind: "phone" | "tablet" | "desktop" };

const browsers: readonly (readonly [RegExp, string])[] = [
    [/Edg(?:A|iOS)?\//, "Edge"],
    [/OPR\/|Opera/, "Opera"],
    [/SamsungBrowser\//, "Samsung Internet"],
    [/Firefox\/|FxiOS\//, "Firefox"],
    [/Chrome\/|CriOS\//, "Chrome"],
    [/Safari\//, "Safari"],
];
const systems: readonly (readonly [RegExp, string])[] = [
    [/iPhone|iPad|iPod/, "iOS"],
    [/Android/, "Android"],
    [/Windows/, "Windows"],
    [/Macintosh|Mac OS X/, "macOS"],
    [/CrOS/, "ChromeOS"],
    [/Linux/, "Linux"],
];

function named ( value: string, table: readonly (readonly [RegExp, string])[] ): string | undefined {

    return table.find(( [pattern] ) => pattern.test(value))?.[1];

}
export function agentOf ( value: string | null | undefined ): Agent | null {

    if ( !value || !/Mozilla\/|AppleWebKit|Gecko\//.test(value) ) return null;

    const browser = named(value, browsers);
    const system = named(value, systems);

    if ( !browser || !system ) return null;

    const kind = /iPad|Tablet/.test(value) ? "tablet" : /Mobi|iPhone|Android/.test(value) ? "phone" : "desktop";

    return { browser, system, kind };

}
