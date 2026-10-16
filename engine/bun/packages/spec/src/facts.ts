import type { Catalogue as Endpoints } from "engine/api";
import { factsOf } from "engine/api";
import { unique } from "engine/array";
import { mapValues } from "engine/base";
import { isMessageKey, type Messages, messageAt, messageTree } from "engine/translate";
import { fieldFacts, shapeKeys } from "engine/validate";
import type { Catalogue } from "./compile.ts";

export function translationIssues (
    value: unknown,
    locales: readonly string[],
    messages: Readonly<Record<string, Messages>>,
    path: string,
): string[] {

    if ( isMessageKey(value) ) {

        return locales.flatMap(( locale ) => {

            const dictionary = messages[locale];

            return dictionary && (messageAt(dictionary, value.key) ?? messageTree(dictionary, value.key)) !== undefined
                ? []
                : [`${path}: missing ${locale} message "${value.key}".`];

        });

    }

    if ( !value || typeof value !== "object" ) return [];

    return Object.entries(value).flatMap(( [key, child] ) =>
        translationIssues(child, locales, messages, `${path}.${key}`),
    );

}
export function catalogueFacts ( endpoints: Endpoints ): Catalogue {

    return mapValues(endpoints, ( operations ) => {

        const { touches } = factsOf(operations);

        return mapValues(operations, ( endpoint ) => {

            const fields = fieldFacts(endpoint.input);

            return {
                method: endpoint.method,
                path: endpoint.path,
                many: endpoint.many,
                input: unique([...shapeKeys(endpoint.input), ...fields.map(( field ) => field.name)]),
                fields,
                output: shapeKeys(endpoint.output),
                permissions: [...endpoint.permissions],
                touches: [...touches],
            };

        });

    });

}
