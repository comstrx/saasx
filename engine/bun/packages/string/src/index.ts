const latinMarks = /[\u0300-\u036f]+/g;
const notWord = /[^\p{L}\p{N}]+/gu;
const boundaries = /([\p{Ll}\p{N}])(\p{Lu})/gu;
const html: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * The words of a text: letters and digits split on anything else and on camelCase boundaries,
 * Latin diacritics stripped so "Café" and "Cafe" read alike while other scripts keep their marks.
 */
export function words(text: string): string[] {
    return text
        .normalize("NFKD")
        .replace(latinMarks, "")
        .normalize("NFC")
        .replace(boundaries, "$1 $2")
        .split(notWord)
        .filter(Boolean);
}
/**
 * A URL-safe slug in any script: lowercase, words joined by dashes, nothing else.
 */
export function slugify(text: string, separator = "-"): string {
    return words(text)
        .map((word) => word.toLowerCase())
        .join(separator);
}
export function capitalize(text: string): string {
    return text ? text[0]?.toUpperCase() + text.slice(1) : text;
}
export function titleCase(text: string): string {
    return words(text)
        .map((word) => capitalize(word.toLowerCase()))
        .join(" ");
}
export function camelCase(text: string): string {
    return words(text)
        .map((word, index) => (index ? capitalize(word.toLowerCase()) : word.toLowerCase()))
        .join("");
}
export function pascalCase(text: string): string {
    return capitalize(camelCase(text));
}
export function kebabCase(text: string): string {
    return slugify(text, "-");
}
export function snakeCase(text: string): string {
    return slugify(text, "_");
}
/**
 * Whitespace runs collapsed to one space, ends trimmed.
 */
export function collapse(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}
/**
 * At most `max` characters (grapheme-safe), the ellipsis counted inside the limit.
 */
export function truncate(text: string, max: number, ellipsis = "…"): string {
    const characters = [...text];

    if (characters.length <= max) return text;

    const keep = Math.max(0, max - [...ellipsis].length);

    return `${characters.slice(0, keep).join("")}${ellipsis}`;
}
/**
 * The middle of a value hidden: the first `start` and last `end` characters stay; an address
 * keeps its domain whole.
 */
export function mask(text: string, start = 1, end = 0, mark = "*"): string {
    const at = text.indexOf("@");

    if (at > 0) return `${mask(text.slice(0, at), start, end, mark)}${text.slice(at)}`;

    const characters = [...text];
    const hidden = Math.max(0, characters.length - start - end);

    if (!hidden) return text;

    return `${characters.slice(0, start).join("")}${mark.repeat(hidden)}${end ? characters.slice(-end).join("") : ""}`;
}
export function initials(name: string, max = 2): string {
    return words(name)
        .slice(0, max)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
}
export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (character) => html[character] ?? character);
}
export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function isBlank(text: string | null | undefined): boolean {
    return !text?.trim();
}
