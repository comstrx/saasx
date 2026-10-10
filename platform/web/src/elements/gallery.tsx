"use client";

import { type ReactNode, useState } from "react";
import { ImageBroken } from "@/lib/providers/icons";

type Picture = { src: string; srcSet?: string; alt: string; label: string };
type Props = {
    pictures: readonly Picture[];
    label: string;
    action: ReactNode;
    more?: ( count: number ) => string;
    layout?: "mosaic" | "booking" | "showcase";
    onSelect: ( index: number, trigger: HTMLButtonElement ) => void;
};

const counts = { mosaic: 5, booking: 8, showcase: 7 };
const lead = "(min-width: 64rem) 50vw, 100vw";
const rest = "(min-width: 64rem) 20vw, 50vw";

export default function Gallery ({ pictures, label, action, more, layout = "mosaic", onSelect }: Props) {

    const shown = pictures.slice(0, counts[layout]);
    const hidden = pictures.length - shown.length;
    const [failed, setFailed] = useState<readonly string[]>([]);
    const [active, setActive] = useState(0);
    const fail = ( src: string ) => setFailed(( list ) => (list.includes(src) ? list : [...list, src]));
    const image = ( picture: Picture, index: number, sizes: string ) => failed.includes(picture.src) ? (

        <span className="media-empty"><ImageBroken /></span>

    ) : (

        <picture className="contents">

            <img
                src={picture.src}
                srcSet={picture.srcSet}
                sizes={sizes}
                alt={picture.alt}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                decoding="async"
                onError={() => fail(picture.src)}
                className="size-full object-cover"
            />

        </picture>

    );

    if ( layout === "showcase" ) {

        const current = shown[active] ?? shown[0];

        return (

            <fieldset className="gallery-showcase" aria-label={label}>

                <div className="gallery-thumbs no-scrollbar">

                    {shown.map(( picture, index ) => (

                        <button
                            key={picture.src}
                            type="button"
                            aria-label={picture.label}
                            aria-pressed={index === active}
                            onClick={() => setActive(index)}
                            onMouseEnter={() => setActive(index)}
                            className="gallery-thumb"
                        >

                            {image(picture, index + 1, "4rem")}

                        </button>

                    ))}

                </div>

                {current ? (

                    <button
                        type="button"
                        aria-label={current.label}
                        onClick={( event ) => onSelect(active, event.currentTarget)}
                        className="gallery-stage"
                    >

                        {image(current, 0, "(min-width: 64rem) 40vw, 100vw")}

                    </button>

                ) : null}

            </fieldset>

        );

    }

    return (

        <fieldset className="relative min-w-0" aria-label={label}>

            <div className={layout === "booking" ? "gallery-booking" : "photo-mosaic"} data-count={shown.length}>

                {shown.map(( picture, index ) => (

                    <button
                        key={picture.src}
                        type="button"
                        aria-label={picture.label}
                        onClick={( event ) => onSelect(index, event.currentTarget)}
                        className="photo-tile"
                    >

                        {image(picture, index, index === 0 ? lead : rest)}

                        {hidden > 0 && index === shown.length - 1 && more ? <span className="gallery-more">{more(hidden)}</span> : null}

                    </button>

                ))}

            </div>

            <button
                type="button"
                onClick={( event ) => onSelect(0, event.currentTarget)}
                className="btn btn-sm ceramic absolute end-4 top-4 text-ink"
            >

                {action}

            </button>

        </fieldset>

    );

}
