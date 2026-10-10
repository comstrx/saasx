import { asciiNumber } from "./number.ts";
import { calendarDate } from "./search.ts";

export type Question = {
    key: string; type?: string | null; scope?: string | null; label?: string | null; hint?: string | null;
    required?: boolean | null; options?: readonly string[] | null; depends_on?: string | null;
    depends_value?: string | number | boolean | readonly (string | number | boolean)[] | null;
};
export type Answer = string | number | boolean | null | (string | number | boolean | null)[];
export type Answers = Record<string, Answer | Answer[]>;
export type QuestionGroup = { question: Question; fields: { key: string; index: number }[] };
type Counts = { applicants: number; adults: number };
type Values = Readonly<Record<string, string>>;
type Fault = "required" | "textLength" | "longText" | "number" | "date" | "time" | "option" | "location" | "file" | "url" | "email";

export function intakeKey ( key: string, index: number ): string {

    return `answers.${key}.${index}`;

}
export function selectedAnswers ( value: string | undefined ): string[] {

    try {

        const parsed: unknown = JSON.parse(value || "[]");

        return Array.isArray(parsed) ? parsed.filter(( item ): item is string => typeof item === "string") : [];

    }
    catch { return []; }

}
function seats ( question: Question, counts: Counts ): number {

    const count = question.scope === "guest" ? counts.adults
        : question.scope === "traveller" || question.scope === "applicant" ? counts.applicants : 1;

    return Number.isSafeInteger(count) ? Math.max(1, Math.min(100, count)) : 1;

}
function scalar ( value: unknown ): string | null {

    if ( value == null ) return null;

    const text = String(value).trim();

    return ["", "null", "undefined"].includes(text) ? null : text;

}
function condition ( value: Answer | undefined ): string | null {

    if ( !Array.isArray(value) ) return scalar(value);

    return JSON.stringify(value).replace(/\//g, "\\/").replace(/[\u0080-\uffff]/g, ( character ) =>
        `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
    );

}
function answerOf ( question: Question, key: string, values: Values ): Answer {

    const raw = values[key] ?? "";

    if ( question.type === "multi_select" ) {

        const chosen = selectedAnswers(raw);

        return chosen.length ? chosen : null;

    }
    if ( question.type === "location" ) {

        const lat = asciiNumber(values[`${key}.latitude`] ?? "").trim();
        const lng = asciiNumber(values[`${key}.longitude`] ?? "").trim();

        return !lat && !lng ? null : [lat ? Number(lat) : null, lng ? Number(lng) : null];

    }

    if ( !raw.trim() ) return null;
    if ( question.type === "boolean" ) return raw === "true" ? true : raw === "false" ? false : raw;
    if ( question.type === "number" || question.type === "file" ) return Number(asciiNumber(raw));

    return raw;

}
function fault ( question: Question, answer: Answer ): Fault | undefined {

    if ( answer === null ) return question.required ? "required" : undefined;

    const text = typeof answer === "string" ? answer : "";
    const options = (question.options ?? []).map(( option ) => option.trim()).filter(Boolean);

    switch ( question.type ) {
        case "number": return typeof answer === "number" && Number.isFinite(answer) ? undefined : "number";
        case "file": return typeof answer === "number" && Number.isSafeInteger(answer) && answer > 0 ? undefined : "file";
        case "boolean": return typeof answer === "boolean" ? undefined : "option";
        case "date": return calendarDate(text) ? undefined : "date";
        case "time": return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? undefined : "time";
        case "select": return options.includes(text) ? undefined : "option";
        case "multi_select": return Array.isArray(answer) && answer.length > 0 && answer.length <= 100
            && answer.every(( value ) => typeof value === "string" && options.includes(value)) ? undefined : "option";
        case "location": return Array.isArray(answer) && answer.length === 2
            && answer.every(( value ) => typeof value === "number" && Number.isFinite(value))
            && Math.abs(Number(answer[0])) <= 90 && Math.abs(Number(answer[1])) <= 180 ? undefined : "location";
        case "email": return /^[^\s@]+@[^\s@]+$/.test(text) ? undefined : "email";
        case "url": {

            try {

                const url = new URL(text);

                return url.protocol && !/\s/.test(text) ? undefined : "url";

            }
            catch { return "url"; }

        }
        case "textarea": return text.length <= 5000 ? undefined : "longText";
        default: return text.length <= 255 ? undefined : "textLength";
    }

}
export function intake ( book: readonly Question[], values: Values, counts: Counts ) {

    const groups: QuestionGroup[] = [];
    const answers: Answers = {};
    const errors: Record<string, Fault> = {};
    const flat = new Map<string, Answer>();
    const visited = new Set<string>();

    for ( const question of book ) {

        if ( visited.has(question.key) ) continue;

        visited.add(question.key);

        const depends = scalar(question.depends_on);
        const expected = Array.isArray(question.depends_value) ? question.depends_value
            : question.depends_value == null ? [] : [question.depends_value];

        if ( depends && depends !== "0" && !expected.map(scalar).includes(condition(flat.get(depends))) ) continue;

        const fields = Array.from({ length: seats(question, counts) }, ( _, index ) => ({ key: intakeKey(question.key, index), index }));
        const given = fields.map(( field ) => {

            const answer = answerOf(question, field.key, values);
            const error = fault(question, answer);

            if ( error ) errors[field.key] = error;

            return answer;

        });

        groups.push({ question, fields });
        answers[question.key] = given.length > 1 ? given : given[0] ?? null;
        flat.set(question.key, given[0] ?? null);

    }

    return { groups, answers, errors };

}
