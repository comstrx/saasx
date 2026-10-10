import { Check } from "@/lib/providers/icons";

type Item = { key: string; label: string; state: "done" | "current" | "next" };
type Props = { label: string; items: readonly Item[] };

export default function Flow ({ label, items }: Props) {

    return (

        <ol aria-label={label} className="flow-steps">

            {items.map(( item, index ) => (

                <li
                    key={item.key} data-state={item.state} className="flow-step"
                    aria-current={item.state === "current" ? "step" : undefined}
                >

                    <span aria-hidden="true" className="flow-dot">{item.state === "done" ? <Check weight="bold" /> : index + 1}</span>

                    <span className="flow-label">{item.label}</span>

                </li>

            ))}

        </ol>

    );

}
