"use client";

import { useAction, useResource } from "engine/context";
import { languageName, localePath, splitLocale } from "engine/translate";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { loadPreferences, savePreferences } from "@/api/workflow/preferences";
import PreferenceForm, { type PreferenceField, type PreferenceName } from "@/components/preference-form";
import Titled from "@/components/titled";
import { useLocale } from "@/hooks/use-locale";
import { preferences, routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; language: string; currency: string; theme: string; themes: { light: string; dark: string; system: string }; saved: string; failed: string };

export default function Panel ({ options, feature }: FeatureProps<Options>) {

    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const save = useAction(savePreferences);
    const known = useResource("preferences", ( signal ) => loadPreferences(signal));
    const saved = known.status === "ready" ? known.value : preferences.defaults;
    const current = { language: locale, currency: saved.currency, theme: saved.theme };
    const themeLabel = ( name: string ): string => options.themes[name as keyof Options["themes"]] ?? name;
    const fields: PreferenceField[] = [
        { name: "language", label: options.language, value: current.language, choices: routing.locales.map(( code ) => ({ value: code, label: languageName(code, code) })) },
        { name: "currency", label: options.currency, value: current.currency, choices: preferences.choices.currencies.map(( code ) => ({ value: code, label: code })) },
        { name: "theme", label: options.theme, value: current.theme, choices: preferences.choices.themes.map(( name ) => ({ value: name, label: themeLabel(name) })) },
    ];
    const change = async ( name: PreferenceName, value: string ): Promise<void> => {

        const saved = await save.run({ [name]: value });

        if ( !saved ) return;
        if ( name === "language" ) router.push(localePath(value, splitLocale(pathname, routing).path, routing) as Route);

        router.refresh();

    };
    const note = save.status === "done" ? { text: options.saved, tone: "success" as const } : save.status === "failed" ? { text: options.failed, tone: "danger" as const } : undefined;

    return (

        <Titled id={feature?.slug ?? "preferences"} title={options.title} primary={feature?.heading ?? false}>

            <PreferenceForm fields={fields} busy={save.status === "pending" || known.status === "loading"} note={note} onChange={change} />

        </Titled>

    );

}
