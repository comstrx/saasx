import { ApiError, configure, credentials } from "@/api/client";
import { account } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import { catalogs } from "@/api/endpoints/catalogs";
import { chat } from "@/api/endpoints/chat";
import { accountOf } from "@/model/account";
import { challenged } from "@/model/auth";
import { listingsOf } from "@/model/catalog";
import { outgoing, platform, type Room, roomOf, threadOf } from "@/model/chat";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";
const qa: Identified = { kind: "email", value: process.env.LIVE_EMAIL ?? "" };

const stamp = Date.now().toString(36);
const minute = 61000;
const long = 300000;

const attempt = ( name: string ) => `chat-${ name }-${ stamp }`;

const pause = ( ms: number ) => new Promise<void>(( done ) => { setTimeout(done, ms); });

const patient = async <T>( task: () => Promise<T>, left = 3 ): Promise<T> => {

    try {

        return await task();

    }
    catch ( failure ) {

        if ( !( failure instanceof ApiError ) || !failure.throttled || left <= 0 ) throw failure;

        await pause(minute);

        return patient(task, left - 1);

    }

};

const reachable = async (): Promise<boolean> => {

    if ( !password || !qa.value ) return false;

    try {

        return ( await fetch(`${ baseUrl }/contract`) ).ok;

    }
    catch {

        return false;

    }

};

let live = false;
let me = 0;
let room: Room | null = null;
let rooms: readonly Room[] = [];

const thread = async ( id: number ) => threadOf(( await chat.messages(id, 1, 100) ).rows, me);

const said = ( body: string, replyId: number | null = null ) => {

    const { body: line, files } = outgoing({ body, replyId });

    return { line, files };

};

describe("live flows · chat", () => {

    beforeAll(async () => {

        live = await reachable();

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

        if ( !live ) return;

        const outcome = await patient(() => auth.login(qa, password, attempt("login")));
        const token = challenged(outcome)
            ? ( await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt("otp"))) ).token
            : outcome.token;

        configure({ token });

        me = accountOf(await account.profile()).id;
        rooms = ( await chat.rooms() ).map(( row ) => roomOf(row, me) );
        room = rooms.find(( entry ) => !platform(entry) ) ?? null;

        if ( !room ) {

            const [ listing ] = listingsOf(await catalogs.list({ limit: 1 }));

            if ( !listing ) throw new Error("no catalog to open a room on");

            room = roomOf(await chat.room(await patient(() => chat.open("catalogs", listing.id, attempt("open")))), me);

        }

    }, long);

    test("a text goes out, takes a reply, an edit, a reaction and a star, then both undo and the reply deletes", async () => {

        if ( !live || !room ) return;

        const id = room.id;
        const first = said(`Flow hello ${ stamp }`);
        const sent = await patient(() => chat.send(id, first.line, first.files, attempt("send")));
        const second = said("Flow reply", sent.id);
        const answered = await patient(() => chat.send(id, second.line, second.files, attempt("reply")));

        expect(threadOf([ answered ], me)[0]?.reply?.id).toBe(sent.id);

        await patient(() => chat.edit(id, sent.id, `Flow edited ${ stamp }`, attempt("edit")));
        await patient(() => chat.react(id, sent.id, "👍", attempt("react")));
        await patient(() => chat.star(id, sent.id, true, attempt("star")));

        const marked = ( await thread(id) ).find(( message ) => message.id === sent.id );

        expect(marked?.body).toBe(`Flow edited ${ stamp }`);
        expect(marked?.edited).toBe(true);
        expect(marked?.starred).toBe(true);
        expect(marked?.reactions.some(( reaction ) => reaction.mine && reaction.emoji === "👍" )).toBe(true);

        await patient(() => chat.unreact(id, sent.id, attempt("unreact")));
        await patient(() => chat.star(id, sent.id, false, attempt("unstar")));

        const plain = ( await thread(id) ).find(( message ) => message.id === sent.id );

        expect(plain?.starred).toBe(false);
        expect(plain?.reactions.some(( reaction ) => reaction.mine )).toBe(false);

        await patient(() => chat.remove(id, answered.id, attempt("remove")));

        expect(( await thread(id) ).some(( message ) => message.id === answered.id )).toBe(false);

        await patient(() => chat.delivered(id, attempt("delivered")));
        await patient(() => chat.read(id, attempt("read")));
        await patient(() => chat.typing(id));

    }, long);

    test("a message forwards into another room and arrives marked forwarded", async () => {

        if ( !live || !room ) return;

        const source = room.id;
        const target = rooms.find(( entry ) => entry.id !== source && !entry.archived );

        if ( !target ) throw new Error("no second room to forward into");

        const note = said(`Flow forward ${ stamp }`);
        const sent = await patient(() => chat.send(source, note.line, note.files, attempt("forward-source")));
        const moved = await patient(() => chat.forward(source, sent.id, target.id, attempt("forward")));

        expect(threadOf([ moved ], me)[0]?.forwarded).toBe(true);
        expect(( await thread(target.id) ).some(( message ) => message.id === moved.id )).toBe(true);

    }, long);

    test("pin, mute and archive flip on and off", async () => {

        if ( !live || !room ) return;

        const id = room.id;

        for ( const mark of [ "pinned", "muted", "archived" ] as const ) {

            await patient(() => chat.flag(id, mark, true, attempt(`${ mark }-on`)));

            expect(roomOf(await chat.room(id), me)[mark]).toBe(true);

            await patient(() => chat.flag(id, mark, false, attempt(`${ mark }-off`)));

            expect(roomOf(await chat.room(id), me)[mark]).toBe(false);

        }

    }, long);

    test("a blocked room refuses a message until it is unblocked", async () => {

        if ( !live || !room ) return;

        const id = room.id;

        try {

            await patient(() => chat.flag(id, "blocked", true, attempt("block")));

            expect(roomOf(await chat.room(id), me).blocked).toBe(true);

            const muted = said("Flow blocked");
            const refused = await chat.send(id, muted.line, muted.files, attempt("blocked-send")).then(() => null, ( failure: unknown ) => failure );

            expect(refused).toBeInstanceOf(ApiError);

        }
        finally {

            await patient(() => chat.flag(id, "blocked", false, attempt("unblock")));

        }

        expect(roomOf(await chat.room(id), me).blocked).toBe(false);

        const freed = said("Flow unblocked");

        await patient(() => chat.send(id, freed.line, freed.files, attempt("unblocked-send")));

    }, long);

    test("a room report is received", async () => {

        if ( !live || !room ) return;

        await patient(() => chat.reportRoom(room?.id ?? 0, "other", "Flow report from the live suite", attempt("report")));

    }, long);

    test("the server takes the app's multipart shape: content, type and files[]", async () => {

        if ( !live || !room ) return;

        const body = new FormData();

        body.append("content", "");
        body.append("type", "file");
        body.append("files[]", new Blob([ "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n" ], { type: "application/pdf" }), "flow.pdf");

        const response = await fetch(`${ baseUrl }/chat/rooms/${ room.id }/messages/send`, {
            method: "POST",
            headers: { ...credentials(), "Idempotency-Key": attempt("media") },
            body,
        });
        const answer = await response.json() as { status?: boolean; data?: { attachments?: readonly unknown[] } };

        expect(answer.status).toBe(true);
        expect(answer.data?.attachments?.length).toBe(1);

    }, long);

    test("a voice note and a video ride the same door and map to their own kinds", async () => {

        if ( !live || !room ) return;

        const id = room.id;
        const clips = [
            { kind: "audio", name: "voice.m4a", mime: "audio/mp4", major: "M4A " },
            { kind: "video", name: "clip.mp4", mime: "video/mp4", major: "isom" },
        ] as const;
        const sent: number[] = [];

        for ( const clip of clips ) {

            const head = new TextEncoder().encode(`ftyp${ clip.major }    ${ clip.major }isommp42`);
            const body = new FormData();

            body.append("content", "");
            body.append("type", clip.kind);
            body.append("files[]", new Blob([ new Uint8Array([ 0, 0, 0, head.length + 4, ...head ]) ], { type: clip.mime }), clip.name);

            const response = await fetch(`${ baseUrl }/chat/rooms/${ id }/messages/send`, {
                method: "POST",
                headers: { ...credentials(), "Idempotency-Key": attempt(clip.kind) },
                body,
            });
            const answer = await response.json() as { status?: boolean; data?: { id?: number; attachments?: readonly unknown[] } };

            expect(answer.status).toBe(true);
            expect(answer.data?.attachments?.length).toBe(1);

            sent.push(answer.data?.id ?? 0);

        }

        const landed = await thread(id);

        clips.forEach(( clip, index ) => {

            expect(landed.find(( message ) => message.id === sent[index] )?.attachments[0]?.kind).toBe(clip.kind);

        });

    }, long);

});
