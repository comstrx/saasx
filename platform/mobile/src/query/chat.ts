import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { type ChatSubject, chat } from "@/api/endpoints/chat";
import {
    attachmentKind,
    type Message,
    messageOf,
    messagePreview,
    outgoing,
    type Room,
    type RoomFlag,
    roomOf,
    type SendMessage,
    sendKind,
    threadOf,
} from "@/model/chat";
import { shelve } from "@/model/shelf";
import { nextPage } from "@/query/shelf";
import { useViewer } from "@/query/wire";
import { key } from "@/std/key";

const typingGap = 2500;

export const threadWindow = 100;

const chatKeys = {
    rooms: [ "chat", "rooms" ] as const,
    room: ( id: number ) => [ "chat", "room", id ] as const,
    messages: ( id: number ) => [ "chat", "messages", id ] as const,
    history: ( id: number ) => [ "chat", "history", id ] as const,
};

export function useRooms () {

    const me = useViewer();

    return useQuery({
        queryKey: chatKeys.rooms,
        queryFn: async () => ( await chat.rooms() ).map(( entry ) => roomOf(entry, me) ),
        enabled: me > 0,
    });

}

export function useRoomsRefresh () {

    const cache = useQueryClient();

    return () => { cache.invalidateQueries({ queryKey: chatKeys.rooms }); };

}

const patched = ( cache: ReturnType<typeof useQueryClient>, id: number, patch: ( room: Room ) => Room ) =>
    cache.setQueryData(chatKeys.rooms, ( current: readonly Room[] | undefined ) =>
        ( current ?? [] ).map(( room ) => room.id === id ? patch(room) : room) );

export function useRoomFlag () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ id, flag, on }: { id: number; flag: RoomFlag; on: boolean }) =>
            chat.flag(id, flag, on, key.attempt(`chat-${ flag }`)),
        onMutate: ({ id, flag, on }) => {

            const previous = cache.getQueryData<readonly Room[]>(chatKeys.rooms);
            const single = cache.getQueryData<Room>(chatKeys.room(id));

            patched(cache, id, ( room ) => ({ ...room, [flag]: on }));

            if ( single ) cache.setQueryData(chatKeys.room(id), { ...single, [flag]: on });

            return { previous, single };

        },
        onError: ( _error, { id }, context ) => {

            cache.setQueryData(chatKeys.rooms, context?.previous);

            if ( context?.single ) cache.setQueryData(chatKeys.room(id), context.single);

        },
        onSettled: ( _data, _error, { id } ) => {

            void cache.invalidateQueries({ queryKey: chatKeys.room(id) });
            void cache.invalidateQueries({ queryKey: chatKeys.rooms });

        },
    });

}

export function useOpenChat () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ subject, id }: { subject: ChatSubject; id: number }) => chat.open(subject, id, key.attempt(`chat-open:${ subject }`)),
        onSuccess: () => { cache.invalidateQueries({ queryKey: chatKeys.rooms }); },
    });

}

export function useSupportRoom () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: () => chat.support(),
        onSuccess: () => { cache.invalidateQueries({ queryKey: chatKeys.rooms }); },
    });

}

export function useRemoveRoom () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( id: number ) => chat.removeRoom(id, key.attempt("chat-room-remove")),
        onMutate: ( id ) => {

            const previous = cache.getQueryData<readonly Room[]>(chatKeys.rooms);

            cache.setQueryData(chatKeys.rooms, ( current: readonly Room[] | undefined ) =>
                ( current ?? [] ).filter(( room ) => room.id !== id) );

            return { previous };

        },
        onError: ( _error, _input, context ) => cache.setQueryData(chatKeys.rooms, context?.previous),
    });

}

export function useReportRoom () {

    return useMutation({
        mutationFn: ({ id, reason, note }: { id: number; reason: string; note: string }) => chat.reportRoom(id, reason, note, key.attempt("chat-report")),
    });

}

export function useRoom ( id: number ) {

    return useQuery({
        queryKey: chatKeys.room(id),
        queryFn: async () => roomOf(await chat.room(id)),
        enabled: id > 0,
    });

}

export function useRoomSeen ( id: number, open: boolean ) {

    const cache = useQueryClient();

    useEffect(() => {

        if ( id <= 0 || !open ) return;

        void chat.delivered(id, key.attempt("chat-delivered")).catch(() => undefined );
        void chat.read(id, key.attempt("chat-read"))
            .then(() => patched(cache, id, ( room ) => ({ ...room, unread: 0 })) )
            .catch(() => undefined );

    }, [ cache, id, open ]);

}

export function useTypingSignal ( id: number ) {

    const last = useRef(0);

    return () => {

        if ( id <= 0 || Date.now() - last.current < typingGap ) return;

        last.current = Date.now();

        void chat.typing(id).catch(() => undefined );

    };

}

export function useMessages ( id: number ) {

    const me = useViewer();

    return useQuery({
        queryKey: chatKeys.messages(id),
        queryFn: async () => threadOf(( await chat.messages(id, 1, threadWindow) ).rows, me),
        enabled: id > 0 && me > 0,
    });

}

export function useHistory ( id: number, wanted: boolean ) {

    const me = useViewer();

    return useInfiniteQuery({
        queryKey: chatKeys.history(id),
        queryFn: async ({ pageParam }) => shelve(await chat.messages(id, pageParam, threadWindow), ( rows ) => threadOf(rows, me)),
        initialPageParam: 2,
        getNextPageParam: nextPage,
        enabled: wanted && id > 0 && me > 0,
    });

}

const optimistic = ( input: SendMessage, me: number, current: readonly Message[] ): Message => {

    const replied = input.replyId ? current.find(( message ) => message.id === input.replyId) : null;

    return {
        id: -Date.now(),
        kind: sendKind(input),
        body: input.body,
        mine: true,
        sender: String(me),
        senderImage: null,
        delivered: false,
        read: false,
        edited: false,
        forwarded: false,
        starred: false,
        pending: true,
        failed: false,
        at: new Date().toISOString(),
        reply: replied ? messagePreview(replied) : null,
        order: null,
        attachments: ( input.files ?? [] ).map(( file, index ) => ({
            id: -( Date.now() + index ),
            name: file.name,
            kind: attachmentKind(file.mime),
            mime: file.mime,
            size: "",
            url: file.uri,
            poster: null,
        })),
        reactions: [],
    };

};

export function useSend ( id: number ) {

    const cache = useQueryClient();
    const me = useViewer();

    return useMutation({
        mutationFn: async ( input: SendMessage ) => {

            const { body, files } = outgoing(input);

            return messageOf(await chat.send(id, body, files, key.attempt("chat-send")), me);

        },
        meta: { field: "file" },
        onMutate: async ( input ) => {

            await cache.cancelQueries({ queryKey: chatKeys.messages(id) });

            const current = cache.getQueryData<readonly Message[]>(chatKeys.messages(id)) ?? [];
            const draft = optimistic(input, me, current);

            cache.setQueryData(chatKeys.messages(id), [ ...current, draft ]);

            return { temporary: draft.id };

        },
        onSuccess: ( message, _input, context ) => {

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => item.id === context?.temporary ? message : item) );
            cache.invalidateQueries({ queryKey: chatKeys.rooms });

        },
        onError: ( _failure, _input, context ) => {

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => item.id === context?.temporary ? { ...item, pending: false, failed: true } : item) );

        },
    });

}

export function useEdit ( id: number ) {

    const cache = useQueryClient();
    const me = useViewer();

    return useMutation({
        mutationFn: async ({ message, content }: { message: number; content: string }) =>
            messageOf(await chat.edit(id, message, content, key.attempt("chat-edit")), me),
        onMutate: async ({ message, content }) => {

            await cache.cancelQueries({ queryKey: chatKeys.messages(id) });
            const previous = cache.getQueryData<readonly Message[]>(chatKeys.messages(id));

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => item.id === message ? { ...item, body: content, edited: true } : item) );

            return { previous };

        },
        onSuccess: ( updated ) => {

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => item.id === updated.id ? updated : item) );

        },
        onError: ( _error, _input, context ) => cache.setQueryData(chatKeys.messages(id), context?.previous),
    });

}

export function useForward ( id: number ) {

    const cache = useQueryClient();
    const me = useViewer();

    return useMutation({
        mutationFn: async ({ message, room }: { message: number; room: number }) =>
            messageOf(await chat.forward(id, message, room, key.attempt("chat-forward")), me),
        onSuccess: ( forwarded, input ) => {

            const existing = cache.getQueryData<readonly Message[]>(chatKeys.messages(input.room));

            if ( existing ) cache.setQueryData(chatKeys.messages(input.room), [ ...existing, forwarded ]);

            cache.invalidateQueries({ queryKey: chatKeys.messages(input.room) });
            cache.invalidateQueries({ queryKey: chatKeys.rooms });

        },
    });

}

export function useReaction ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ message, emoji }: { message: number; emoji: string | null }) =>
            emoji
                ? chat.react(id, message, emoji, key.attempt("chat-reaction"))
                : chat.unreact(id, message, key.attempt("chat-unreaction")),
        onMutate: ({ message, emoji }) => {

            const previous = cache.getQueryData<readonly Message[]>(chatKeys.messages(id));

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => {

                    if ( item.id !== message ) return item;

                    const withoutMine = item.reactions
                        .map(( reaction ) => reaction.mine ? { ...reaction, count: reaction.count - 1, mine: false } : reaction)
                        .filter(( reaction ) => reaction.count > 0);

                    if ( !emoji ) return { ...item, reactions: withoutMine };

                    const found = withoutMine.find(( reaction ) => reaction.emoji === emoji);
                    const reactions = found
                        ? withoutMine.map(( reaction ) => reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1, mine: true } : reaction)
                        : [ ...withoutMine, { emoji, count: 1, mine: true } ];

                    return { ...item, reactions };

                }) );

            return { previous };

        },
        onError: ( _error, _input, context ) => cache.setQueryData(chatKeys.messages(id), context?.previous),
    });

}

export function useStar ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ message, starred }: { message: number; starred: boolean }) =>
            chat.star(id, message, starred, key.attempt("chat-star")),
        onMutate: ({ message, starred }) => {

            const previous = cache.getQueryData<readonly Message[]>(chatKeys.messages(id));

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).map(( item ) => item.id === message ? { ...item, starred } : item) );

            return { previous };

        },
        onError: ( _error, _input, context ) => cache.setQueryData(chatKeys.messages(id), context?.previous),
    });

}

export function useRemoveMessage ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( message: number ) => chat.remove(id, message, key.attempt("chat-remove")),
        onMutate: ( message ) => {

            const previous = cache.getQueryData<readonly Message[]>(chatKeys.messages(id));

            cache.setQueryData(chatKeys.messages(id), ( current: readonly Message[] | undefined ) =>
                ( current ?? [] ).filter(( item ) => item.id !== message) );

            return { previous };

        },
        onError: ( _error, _input, context ) => cache.setQueryData(chatKeys.messages(id), context?.previous),
    });

}
