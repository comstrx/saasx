export const toggleMember = <T>( values: readonly T[], value: T ): readonly T[] =>
    values.includes(value) ? values.filter(( entry ) => entry !== value) : [ ...values, value ];
