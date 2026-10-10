import { type RankName, ranks } from "@/theme/text";

const ladder: readonly RankName[] = [ "figure", "hero", "price", "display", "heading", "title", "action", "label", "caption", "note", "micro" ];

const pairs: readonly [ RankName, RankName ][] = [ [ "figure", "label" ], [ "price", "note" ], [ "hero", "caption" ] ];

const metrics = Object.values(ranks).flatMap(( rank ) => [ rank.latin, rank.arabic ] );

describe("the type ladder", () => {

    test("reads as one descending ladder in both scripts", () => {

        for ( const script of [ "latin", "arabic" ] as const ) {

            const sizes = ladder.map(( rank ) => ranks[rank][script].size );

            expect([ script, sizes ]).toEqual([ script, [ ...sizes ].sort(( first, second ) => second - first ) ]);

        }

    });

    test("each script is one scale of at most nine whole sizes", () => {

        for ( const [ script, floor ] of [ [ "latin", 12 ], [ "arabic", 11 ] ] as const ) {

            const sizes = new Set(Object.values(ranks).map(( rank ) => rank[script].size ));

            expect(sizes.size).toBeLessThanOrEqual(9);
            expect([ ...sizes ].every(Number.isInteger)).toBe(true);
            expect(Math.min(...sizes)).toBeGreaterThanOrEqual(floor);

        }

    });

    test("an arabic rank is the optically smaller step of its latin twin", () => {

        for ( const rank of Object.values(ranks) ) {

            expect(rank.arabic.size).toBeLessThan(rank.latin.size);
            expect(rank.arabic.size / rank.latin.size).toBeGreaterThanOrEqual(0.84);

        }

    });

    test("arabic never leans on weight, and nothing leans on tracking", () => {

        for ( const rank of Object.values(ranks) ) {

            expect(Number(rank.arabic.weight)).toBeLessThanOrEqual(500);
            expect(rank.latin.track).toBe(0);
            expect(rank.arabic.track).toBe(0);

        }

    });

    test("a value outweighs its own word by at least 1.6", () => {

        for ( const [ value, word ] of pairs ) {

            for ( const script of [ "latin", "arabic" ] as const ) {

                expect(ranks[value][script].size / ranks[word][script].size).toBeGreaterThanOrEqual(1.6);

            }

        }

    });

    test("a section header outranks the titles inside it by a whole step", () => {

        for ( const script of [ "latin", "arabic" ] as const ) {

            expect(ranks.heading[script].size - ranks.title[script].size).toBeGreaterThanOrEqual(2);

        }

    });

    test("every rank breathes", () => {

        for ( const metric of metrics ) expect(metric.height / metric.size).toBeGreaterThanOrEqual(1.35);

    });

});
