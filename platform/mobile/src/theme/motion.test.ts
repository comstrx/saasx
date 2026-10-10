import { type SpringName, springPath, springs } from "@/theme/motion";

const duties: Record<SpringName, { ms: number; settles: boolean }> = {
    press: { ms: 90, settles: true },
    glide: { ms: 150, settles: true },
    snap: { ms: 200, settles: true },
    sheet: { ms: 260, settles: true },
    enter: { ms: 400, settles: true },
    settle: { ms: 400, settles: true },
    trail: { ms: 300, settles: false },
    release: { ms: 260, settles: false },
    bounce: { ms: 420, settles: false },
};

describe("springPath", () => {

    test("every token starts at rest, ends exactly on its target and takes a finite time", () => {

        for ( const spring of Object.values(springs) ) {

            const path = springPath(spring);

            expect(path.points[0]).toBe(0);
            expect(path.points.at(-1)).toBe(1);
            expect(path.duration).toBeGreaterThan(0);
            expect(path.duration).toBeLessThan(2000);

        }

    });

    test("every token lands on the duration its job is written for", () => {

        for ( const [ name, duty ] of Object.entries(duties) ) {

            expect([ name, springPath(springs[name as SpringName]).duration ]).toEqual([ name, duty.ms ]);

        }

    });

    test("functional motion never overshoots — only a moment may pop", () => {

        for ( const [ name, duty ] of Object.entries(duties) ) {

            const peak = Math.max(...springPath(springs[name as SpringName]).points);

            if ( duty.settles ) expect([ name, peak ]).toEqual([ name, 1 ]);
            else expect(peak).toBeGreaterThan(1);

        }

    });

    test("a critically damped or overdamped spring never passes its target", () => {

        for ( const damping of [ 2 * Math.sqrt(400), 60 ] ) {

            const path = springPath({ damping, stiffness: 400, mass: 1 });

            expect(Math.max(...path.points)).toBeLessThanOrEqual(1);
            expect([ ...path.points ].sort(( first, second ) => first - second )).toEqual([ ...path.points ]);

        }

    });

});
