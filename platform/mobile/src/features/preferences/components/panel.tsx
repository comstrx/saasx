import { languageName } from "engine/translate";
import { useState } from "react";
import PreferenceForm, { type PreferenceField, type PreferenceName } from "@/components/preference-form";
import Titled from "@/components/titled";
import { usePreferences } from "@/hooks/use-locale";
import { routing } from "@/lib/spec/config";
import type { FeatureProps } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { config } from "@/lib/spec/runtime";

export type Options = { title: string; language: string; currency: string; theme: string; themes: { light: string; dark: string; system: string }; saved: string };

export default function Panel ({ options, feature }: FeatureProps<Options>) {

    const current = usePreferences();
    const [changed, setChanged] = useState(false);
    const themeLabel = ( name: string ): string => options.themes[name as keyof Options["themes"]] ?? name;
    const fields: PreferenceField[] = [
        { name: "language", label: options.language, value: current.language, choices: routing.locales.map(( code ) => ({ value: code, label: languageName(code, code) })) },
        { name: "currency", label: options.currency, value: current.currency, choices: config.settings.currency.enabled.map(( code ) => ({ value: code, label: code })) },
        { name: "theme", label: options.theme, value: current.theme, choices: config.settings.theme.enabled.map(( name ) => ({ value: name, label: themeLabel(name) })) },
    ];
    const change = ( name: PreferenceName, value: string ): void => {

        if ( name === "language" ) current.choose({ language: value as Locale });
        else if ( name === "theme" ) current.choose({ theme: value as "light" | "dark" | "system" });
        else current.choose({ currency: value });

        setChanged(true);

    };

    return (

        <Titled id={feature?.slug ?? "preferences"} title={options.title} primary={feature?.heading ?? false}>

            <PreferenceForm fields={fields} note={changed ? { text: options.saved, tone: "success" } : undefined} onChange={change} />

        </Titled>

    );

}
