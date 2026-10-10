type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other";

type Forms<T> = {
    [K in Extract<keyof T, string> as T[K] extends string ? `${ K }_${ PluralForm }` : never]?: string;
};

export type Localized<T> = { [K in keyof T]: T[K] extends string ? string : Localized<T[K]> } & Forms<T>;
