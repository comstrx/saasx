import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof loader> & { label: string; caption?: string };

const loader = tv({
    slots: {
        scene: "loader-scene",
        ring: "spinner spinner-xl text-primary",
        caption: "text-small font-medium text-muted",
    },
    variants: {
        layout: {
            screen: { scene: "loader-screen" },
            block: { scene: "min-h-72" },
            section: { scene: "min-h-56 rounded-3xl border border-edge bg-panel shadow-sm" },
            inline: { scene: "min-h-40", ring: "spinner-lg" },
        },
    },
    defaultVariants: { layout: "block" },
});

export default function Loader ({ label, caption, layout }: Props) {

    const styles = loader({ layout });

    return (

        <div role="status" aria-live="polite" className={styles.scene()}>

            <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.ring()}>

                <circle cx="12" cy="12" r="10" />

                <circle cx="12" cy="12" r="10" pathLength="100" />

            </svg>

            {caption ? <span aria-hidden="true" className={styles.caption()}>{caption}</span> : null}

            <span className="sr-only">{label}</span>

        </div>

    );

}
