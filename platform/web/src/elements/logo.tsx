import type { Route } from "next";
import NextLink from "next/link";

type Props = { href: string; src: string | null; dark?: string | null; alt: string; width?: number | null; height?: number | null };

export default function Logo ({ href, src, dark, alt, width, height }: Props) {

    const size = { width: width ?? undefined, height: height ?? undefined };
    const light = dark ? "logo-size dark:hidden" : "logo-size";

    return (

        <NextLink href={href as Route} prefetch={false} aria-label={alt} className="inline-flex shrink-0 rounded-lg press-motion">

            {

                src ? (

                    <>

                        <picture className="contents">

                            <img src={src} alt={alt} {...size} fetchPriority="high" className={light} />

                        </picture>

                        {dark ? (

                            <picture className="contents">

                                <img src={dark} alt={alt} {...size} decoding="async" className="logo-size hidden dark:block" />

                            </picture>

                        ) : null}

                    </>

                ) : <span className="text-h3 font-bold text-accent">{alt}</span>

            }

        </NextLink>

    );

}
