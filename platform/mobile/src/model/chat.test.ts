import type { LineRow, RoomRow } from "@/api/endpoints/chat";
import { type Message, mergeThread, messageOf, roomOf } from "@/model/chat";

const line = ( id: number, at: string ): Message => ({ id, at }) as Message;

const system: LineRow = { id: 25, type: "system", content: "This conversation is about order #458.", reference_type: "order", reference: { id: 458 } };

describe("a thread merged from its history and its live window", () => {

    test("keeps the live copy of a message both carry, in time order", () => {

        const live = line(2, "2026-09-02T10:00:00Z");
        const merged = mergeThread([ line(1, "2026-09-01T10:00:00Z"), line(2, "2026-09-02T10:00:00Z") ], [ live, line(3, "2026-09-03T10:00:00Z") ]);

        expect(merged.map(( message ) => message.id )).toEqual([ 1, 2, 3 ]);
        expect(merged[1]).toBe(live);

    });

    test("orders older pages that arrive newest page first", () => {

        const merged = mergeThread([ line(5, "2026-09-05T10:00:00Z"), line(4, "2026-09-04T10:00:00Z") ], []);

        expect(merged.map(( message ) => message.id )).toEqual([ 4, 5 ]);

    });

});

describe("a system line that points at an order", () => {

    test("carries the order it is about, so the app can speak it in the reader's language", () => {

        expect(messageOf(system, 9).order).toBe(458);
        expect(messageOf({ id: 26, type: "text", content: "hello" }, 9).order).toBeNull();
        expect(messageOf({ ...system, reference_type: "catalog" }, 9).order).toBeNull();

    });

    test("reaches the inbox preview through the room's last line", () => {

        const room: RoomRow = { id: 9, last_message: system };

        expect(roomOf(room, 9).lastOrder).toBe(458);
        expect(roomOf({ id: 2 }, 9).lastOrder).toBeNull();

    });

});
