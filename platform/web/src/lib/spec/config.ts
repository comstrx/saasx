import connections from "@spec/connections";
import routing from "@spec/routing";

export { routing };

const selected = process.env.NEXT_PUBLIC_SPEC;

if ( !selected ) throw new Error("The build must select NEXT_PUBLIC_SPEC.");

export const identity = selected;
export const connectOrigins = connections.origins;
export const imageOrigins = connections.images;
export const frameOrigins = connections.frames;

export const preferences = {
    cookies: {
        language: `${selected}.locale`,
        currency: `${selected}.currency`,
        country: `${selected}.country`,
        location: `${selected}.location`,
    },
    maxAge: 60 * 60 * 24 * 365,
};

export const appearance = {
    storageKey: `${selected}.theme`,
    attribute: "data-theme",
} as const;
