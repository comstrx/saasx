import { useDeferredValue, useMemo, useState } from "react";
import EmojiPicker from "@/components/emoji-picker";
import EmojiStage from "@/components/emoji-stage";
import Titled from "@/components/titled";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";
import { world } from "@/lib/spec/world";

export type Options = { title: string; placeholder: string; empty: string };

export default function Board ({ options, feature }: FeatureProps<Options>) {

    const language = useLocale() === "ar" ? "ar" : "en";
    const [query, setQuery] = useState("");
    const [group, setGroup] = useState(world.emojis.groups[0]?.key ?? "");
    const [chosen, setChosen] = useState("👍");
    const typed = useDeferredValue(query.trim());
    const picks = useMemo(() => {

        const found = world.emojis.browse({ query: typed, group: typed ? undefined : group });

        return found.map(( entry ) => ({ glyph: entry.glyph, label: entry.name[language] }));

    }, [typed, group, language]);
    const groups = useMemo(() => world.emojis.groups.map(( entry ) => ({ key: entry.key, label: entry.name[language] })), [language]);
    const shown = world.emojis.get(chosen);

    return (

        <Titled id={feature?.slug ?? "emoji"} title={options.title} primary={feature?.heading ?? false} fill>

            <EmojiStage glyph={chosen} name={shown?.name[language] ?? chosen} keywords={(shown?.keywords[language] ?? []).join(" · ")} />

            <EmojiPicker
                placeholder={options.placeholder}
                empty={options.empty}
                query={query}
                onQuery={setQuery}
                groups={groups}
                group={group}
                onGroup={setGroup}
                picks={picks}
                onPick={setChosen}
            />

        </Titled>

    );

}
