import NextImage from "next/image";

type Props = { src: string | null | undefined; alt: string; ratio?: "square" | "wide" | undefined; sizes?: string | undefined };

export default function Image ({ src, alt, ratio = "wide", sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" }: Props) {

    return (

        <span className="image" data-ratio={ratio} data-empty={src ? undefined : ""}>

            {src ? <NextImage src={src} alt={alt} fill sizes={sizes} /> : null}

        </span>

    );

}
