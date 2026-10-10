/** The greeting `helloWorld` returns; a literal type, usable where a constant is required. */
export const GREETING = "Hello, world!" as const;

export const helloWorld = (): typeof GREETING => GREETING;
