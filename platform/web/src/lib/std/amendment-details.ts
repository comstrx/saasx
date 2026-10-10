import { amendmentDate, changeText } from "./amendments.ts";
import { money } from "./format.ts";
import type { Question } from "./intake.ts";
import { isRecord } from "./object.ts";

type Row = { key: string; label: string; before?: string; after: string };
type Labels = Record<string, string>;

export function amendmentDetails (
    changes: Record<string, unknown>, current: Record<string, unknown> | undefined,
    labels: Labels, locale: string, timeZone: string, currency: string, questions: readonly Question[] = [],
): Row[] {

    const display = ( key: string, value: unknown ): string => {

        if ( key === "base_price" && (typeof value === "string" || typeof value === "number") ) {

            const price = money(value, locale, currency, true);

            return price ? [price.number, price.currency].join(" ") : labels.empty || "";

        }

        if ( key === "pets" || typeof value === "boolean" ) return (value ? labels.yes : labels.no) ?? "";
        if ( ["starts_at", "ends_at", "birth_date"].includes(key) ) return amendmentDate(value, locale, timeZone) || labels.empty || "";

        return changeText(value) || labels.empty || "";

    };
    const row = ( key: string, label: string, before: unknown, after: unknown, kind = key ): Row => ({
        key, label, ...(current ? { before: display(kind, before) } : {}), after: display(kind, after),
    });

    return Object.entries(changes).flatMap(( [key, value] ) => {

        if ( key === "applicants" && Array.isArray(value) ) {

            const previous = Array.isArray(current?.applicants) ? current.applicants : [];

            return value.flatMap(( applicant: unknown, index ) => {

                if ( !isRecord(applicant) ) return [];

                const before = isRecord(previous[index]) ? previous[index] : {};

                return ["name", "birth_date", "nationality", "residency"].map(( field ) =>
                    row([key, index, field].join("."), `${labels.applicants} ${index + 1} · ${labels[field]}`,
                        before[field], applicant[field], field)
                );

            });

        }
        if ( key === "answers" && Array.isArray(value) ) {

            const previous = Array.isArray(current?.answers) ? current.answers : [];

            return value.filter(isRecord).map(( answer, index ) => {

                const before = previous.find(( item: unknown ) => isRecord(item) && item.key === answer.key && item.index === answer.index);
                const title = questions.find(( question ) => question.key === answer.key)?.label || String(index + 1);
                const person = typeof answer.index === "number" ? ` · ${answer.index + 1}` : "";

                return row([key, index].join("."), `${labels.answers} · ${title}${person}`,
                    isRecord(before) ? before.value : undefined, answer.value);

            });

        }

        return [row(key, labels[key] ?? key, current?.[key], value)];

    });

}
