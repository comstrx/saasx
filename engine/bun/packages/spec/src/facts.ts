import type { Catalogue as Endpoints } from "@engine/api";
import { factsOf } from "@engine/api";
import { mapValues } from "@engine/base";
import { type Messages, messageAt, messageTree } from "@engine/translate";
import { fieldFacts, shapeKeys } from "@engine/validate";
import type { Catalogue } from "./compile.ts";
import { isSpecKey } from "./fields.ts";

export function translationIssues(
    value: unknown,
    locales: readonly string[],
    messages: Readonly<Record<string, Messages>>,
    path: string,
): string[] {
    if (isSpecKey(value)) {
        return locales.flatMap((locale) => {
            const dictionary = messages[locale];

            return dictionary && (messageAt(dictionary, value.key) ?? messageTree(dictionary, value.key)) !== undefined
                ? []
                : [`${path}: missing ${locale} message "${value.key}".`];
        });
    }
    if (!value || typeof value !== "object") return [];

    return Object.entries(value).flatMap(([key, child]) =>
        translationIssues(child, locales, messages, `${path}.${key}`),
    );
}
export function catalogueFacts(endpoints: Endpoints): Catalogue {
    return mapValues(endpoints, (operations) => {
        const { permissions, touches } = factsOf(operations);

        return mapValues(operations, (endpoint) => {
            return {
                method: endpoint.method,
                path: endpoint.path,
                many: endpoint.many,
                input: shapeKeys(endpoint.input),
                fields: fieldFacts(endpoint.input),
                output: shapeKeys(endpoint.output),
                permissions: [...permissions],
                touches: [...touches],
            };
        });
    });
}
