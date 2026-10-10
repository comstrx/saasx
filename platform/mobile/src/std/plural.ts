type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

type Rule = {
    categories: readonly PluralCategory[];
    select: ( value: number ) => PluralCategory;
};

const english: Rule = {
    categories: [ "one", "other" ],
    select: ( value ) => Number.isInteger(value) && Math.abs(value) === 1 ? "one" : "other",
};

const arabic: Rule = {
    categories: [ "zero", "one", "two", "few", "many", "other" ],
    select: ( value ) => {

        if ( !Number.isInteger(value) ) return "other";

        const count = Math.abs(value);
        const hundred = count % 100;

        if ( count === 0 ) return "zero";
        if ( count === 1 ) return "one";
        if ( count === 2 ) return "two";
        if ( hundred >= 3 && hundred <= 10 ) return "few";
        if ( hundred >= 11 && hundred <= 99 ) return "many";

        return "other";

    },
};

const rules: Record<string, Rule> = {
    ar: arabic,
    en: english,
};

const ruleFor = ( locale: string | undefined ): Rule => rules[( locale ?? "en" ).split("-")[0] ?? "en"] ?? english;

class Plural {

    private readonly rule: Rule;
    private readonly locale: string;

    constructor ( locale?: string | readonly string[], _options?: unknown ) {

        this.locale = ( Array.isArray(locale) ? locale[0] : locale ) as string ?? "en";
        this.rule = ruleFor(this.locale);

    }
    select ( value: number ): PluralCategory {

        return this.rule.select(value);

    }
    resolvedOptions () {

        return { locale: this.locale, type: "cardinal" as const, pluralCategories: [ ...this.rule.categories ] };

    }

}

export const installPluralRules = () => {

    const scope = Intl as unknown as { PluralRules?: unknown };

    if ( scope.PluralRules ) return;

    scope.PluralRules = Plural;

};
