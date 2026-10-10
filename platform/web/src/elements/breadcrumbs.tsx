import type { Route } from "next";
import NextLink from "next/link";
import { CaretRight } from "@/lib/providers/icons";

type Props = { label: string; items: readonly { label: string; href?: string }[] };

export default function Breadcrumbs ({ label, items }: Props) {

    return (

        <nav aria-label={label} className="min-w-0">

            <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-label text-muted">

                {items.map(( item, index ) => (

                    <li key={item.href ?? item.label} className="flex min-w-0 items-center gap-1.5">

                        {index > 0 ? <CaretRight aria-hidden="true" weight="bold" className="size-3 shrink-0 rtl:-scale-x-100" /> : null}

                        {item.href && index < items.length - 1 ? (

                            <NextLink href={item.href as Route} prefetch={false} dir="auto" className="truncate hover:text-ink">

                                {item.label}

                            </NextLink>

                        ) : (

                            <span aria-current={index === items.length - 1 ? "page" : undefined} dir="auto" className="truncate text-ink">

                                {item.label}

                            </span>

                        )}

                    </li>

                ))}

            </ol>

        </nav>

    );

}
