"use client";

import { useDeferredValue, useMemo, useState } from "react";
import EmojiPicker from "@/components/emoji-picker";
import EmojiStage from "@/components/emoji-stage";
import Titled from "@/components/titled";
import { useLocale } from "@/hooks/use-locale";
import { emoji } from "@/lib/spec/emoji";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { title: string; placeholder: string; empty: string; tone: string };

const hand = "✋";

export default function Board ({ options, feature }: FeatureProps<Options>) {

    const locale = useLocale();
    const language = locale === "ar" ? "ar" : "en";
    const [query, setQuery] = useState("");
    const [group, setGroup] = useState(emoji.groups[0]?.key ?? "");
    const [tone, setTone] = useState("");
    const [chosen, setChosen] = useState("👍");
    const typed = useDeferredValue(query.trim());
    const picks = useMemo(() => (typed ? emoji.search(typed, 160) : emoji.of(group)).filter(( entry ) => entry.assets.static).map(( entry ) => ({ glyph: tone && entry.assets.tones ? emoji.tone(entry.glyph, tone) : entry.glyph, label: entry.name[language] })), [typed, group, tone, language]);
    const shown = emoji.get(chosen);
    const groups = useMemo(() => emoji.groups.map(( entry ) => ({ key: entry.key, label: entry.name[language] })), [language]);
    const tones = useMemo(() => [{ key: "", label: options.tone, glyph: hand }, ...emoji.tones.map(( entry ) => ({ key: entry.key, label: entry.name[language], glyph: emoji.tone(hand, entry.key) }))], [options.tone, language]);

    return (

        <Titled id={feature?.slug ?? "emoji"} title={options.title} primary={feature?.heading ?? false}>

            <EmojiStage glyph={chosen} name={shown?.name[language] ?? chosen} keywords={(shown?.keywords[language] ?? "").replaceAll("|", " · ")} />

            <EmojiPicker placeholder={options.placeholder} empty={options.empty} query={query} onQuery={setQuery} groups={groups} group={group} onGroup={setGroup} tones={tones} tone={tone} onTone={setTone} picks={picks} onPick={setChosen} />

        </Titled>

    );

}
