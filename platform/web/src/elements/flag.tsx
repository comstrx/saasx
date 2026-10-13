import { world } from "@/lib/spec/world";

type Props = { code: string; size?: "sm" | "md" | undefined };

export default function Flag ({ code, size = "md" }: Props) {

    const country = world.countries.get(code);

    if ( !country ) return <span className="flag" data-size={size} aria-hidden>{world.flagEmoji(code)}</span>;

    return <img className="flag" data-size={size} src={world.flagOf(code)} alt={country.name.en} width={24} height={18} loading="lazy" decoding="async" />;

}
