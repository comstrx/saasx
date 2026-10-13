type Props = { src: string | null | undefined; alt: string; ratio?: "square" | "wide" | undefined };

export default function Image ({ src, alt, ratio = "wide" }: Props) {
    return (

        <span className="image" data-ratio={ratio} data-empty={src ? undefined : ""}>

            {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : null}

        </span>

    );
}
