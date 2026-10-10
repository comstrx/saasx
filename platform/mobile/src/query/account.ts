import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ApiError, current, media } from "@/api/client";
import { account, type DeviceInput, type Proof } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import {
    type Account,
    type AccountPreferences,
    accountOf,
    type Closure,
    locationBody,
    type NotifyPatch,
    notifyBody,
    type ProfileEdit,
    settingsOf,
} from "@/model/account";
import { levelOf, rewardOf, tiersOf } from "@/model/level";
import { useSigned } from "@/query/wire";
import type { UploadFile } from "@/std/file";
import { key } from "@/std/key";

const hour = 3600000;

const accountKeys = {
    profile: [ "account", "profile" ] as const,
    level: [ "account", "level" ] as const,
    rewards: [ "account", "rewards" ] as const,
    tiers: [ "levels" ] as const,
    settings: [ "account", "settings" ] as const,
};

const edited = ( edit: ProfileEdit, attempt: string ): Promise<unknown> => {

    if ( edit.slot === "name" ) return account.saveName(edit.name, attempt);
    if ( edit.slot === "password" ) return account.savePassword(edit.current, edit.next, attempt);
    if ( edit.slot === "phone" ) return account.savePhone(edit.phone, edit.password, attempt);
    if ( edit.slot === "email" ) return account.saveEmail(edit.email, edit.password, attempt);
    if ( edit.slot === "location" ) return account.saveLocation(locationBody(edit.location), attempt);
    if ( edit.slot === "send" ) return account.sendCode(edit.field, attempt);

    return account.confirmContact(edit.field, edit.code, attempt);

};

export function useAccount () {

    const signed = useSigned();

    return useQuery({
        queryKey: accountKeys.profile,
        queryFn: async () => accountOf(await account.profile()),
        enabled: signed,
    });

}

export function useLevel () {

    const signed = useSigned();

    return useQuery({
        queryKey: accountKeys.level,
        queryFn: async () => levelOf(await account.level()),
        staleTime: hour,
        enabled: signed,
    });

}

export function useTiers ( enabled = true ) {

    return useQuery({
        queryKey: accountKeys.tiers,
        queryFn: async () => tiersOf(await account.tiers()),
        enabled,
        staleTime: 600000,
    });

}

export function useRewards () {

    const signed = useSigned();

    return useQuery({
        queryKey: accountKeys.rewards,
        queryFn: async () => ( await account.rewards() ).map(rewardOf),
        enabled: signed,
    });

}

export function useSettings () {

    const signed = useSigned();

    return useQuery({
        queryKey: accountKeys.settings,
        queryFn: async () => settingsOf(await account.settings()),
        enabled: signed,
    });

}

export function useNotifyPrefs () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( patch: NotifyPatch ) => account.saveSettings(notifyBody(patch), key.attempt(`notify:${ patch.topic }:${ patch.channel?.key ?? "topic" }`)),
        onSettled: () => cache.invalidateQueries({ queryKey: accountKeys.settings }),
    });

}

export function useSavePreferences () {

    const cache = useQueryClient();

    return useMutation({
        networkMode: "always",
        mutationFn: ({ patch, attempt, viewer }: { patch: Partial<AccountPreferences>; attempt: string; viewer?: number }) => {

            if ( viewer !== undefined && viewer !== current().viewer ) throw new ApiError(0, "cancelled", "", null);
            return account.saveSettings(patch, attempt);

        },
        meta: { quiet: true },
        onMutate: () => cache.cancelQueries({ queryKey: accountKeys.profile }),
        onSuccess: ( _, { patch, viewer } ) => {

            if ( viewer !== undefined && viewer !== current().viewer ) return;
            cache.setQueryData<Account>(accountKeys.profile, ( held ) => held && held.id === current().viewer
                ? { ...held, preferences: { ...held.preferences, ...patch } } : held );
            cache.invalidateQueries({ queryKey: accountKeys.profile });
            cache.invalidateQueries({ queryKey: accountKeys.settings });

        },
    });

}

export function useProfileEdit () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ edit, attempt }: { edit: ProfileEdit; attempt: string }) => edited(edit, attempt),
        meta: { quiet: true },
        onSuccess: () => { cache.invalidateQueries({ queryKey: accountKeys.profile }); },
    });

}

export function useCloseAccount () {

    return useMutation({
        mutationFn: ({ closure, proof, attempt }: { closure: Closure; proof: Proof; attempt: string }) =>
            closure === "erase" ? account.requestDeletion(proof, attempt) : account.deactivate(proof, attempt),
        meta: { quiet: true },
    });

}

export function useRegisterDevice () {

    return useMutation({
        mutationFn: ( input: DeviceInput ) => account.registerDevice(input),
        meta: { quiet: true },
    });

}

export function useAvatar () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ( file: UploadFile | null ): Promise<string | null> => {

            if ( !file ) { await account.dropImage(key.attempt("avatar-drop")); return null; }

            return media(await account.saveImage(file, key.attempt("avatar")));

        },
        meta: { quiet: true },
        onSuccess: ( image ) => {

            void Image.clearMemoryCache();
            void Image.clearDiskCache();

            cache.setQueryData<Account>(accountKeys.profile, ( held ) => held ? { ...held, image } : held );
            cache.invalidateQueries({ queryKey: accountKeys.profile });

        },
    });

}

export function useConfirmEmail () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( token: string ) => auth.confirmEmail(token, key.attempt("confirm-email")),
        meta: { quiet: true },
        onSuccess: () => { cache.invalidateQueries({ queryKey: accountKeys.profile }); },
    });

}
