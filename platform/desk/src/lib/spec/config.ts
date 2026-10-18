import routing from "@spec/routing";

export { routing };

const selected = process.env.DESK_SPEC;

if ( !selected ) throw new Error("The build must select DESK_SPEC.");

export const identity = selected;

export const storage = { session: `${selected}.session`, preferences: `${selected}.preferences` } as const;
