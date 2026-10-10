export type Rule = {
    key: string;
    met: boolean;
};

export type PasswordPolicy = {
    min: number;
    max: number;
    lower: boolean;
    upper: boolean;
    digit: boolean;
    symbol: boolean;
};

type Mark = "upper" | "lower" | "digit" | "symbol";

const marks: readonly ( readonly [ Mark, RegExp ] )[] = [
    [ "upper", /[A-Z]/ ],
    [ "lower", /[a-z]/ ],
    [ "digit", /\d/ ],
    [ "symbol", /[\W_]/ ],
];

export const rules = ( value: string, policy: PasswordPolicy ): readonly Rule[] => [
    { key: "length", met: value.length >= policy.min && value.length <= policy.max },
    ...marks.filter(([ mark ]) => policy[mark] ).map(([ key, pattern ]) => ({ key, met: pattern.test(value) }) ),
];

export const strong = ( value: string, policy: PasswordPolicy ): boolean => rules(value, policy).every(( rule ) => rule.met );
