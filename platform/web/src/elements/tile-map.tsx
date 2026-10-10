"use client";

import type { Route } from "next";
import NextLink from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

type Point = {
    key: string; latitude: number; longitude: number; label: string; title: string; href: string | null; image?: string | null;
    meta?: string | null; kind?: "label" | "home" | "dot";
};
type Props = {
    label: string; credit: string; tiles: string; points: readonly Point[]; size?: "full" | "inset" | "section";
    link?: { href: string; label: string; glyph?: ReactNode } | null;
};
type View = { zoom: number; left: number; top: number; width: number; height: number };

const side = 256;
const pad = 56;
const deepest = { full: 13, inset: 15, section: 16 } as const;
const shallowest = 2;
const subdomains = ["a", "b", "c"];

function project ( latitude: number, longitude: number, zoom: number ) {

    const span = side * 2 ** zoom;
    const shaped = Math.min(85.05112878, Math.max(-85.05112878, latitude)) * Math.PI / 180;

    return {
        x: (longitude + 180) / 360 * span,
        y: (1 - Math.log(Math.tan(shaped) + 1 / Math.cos(shaped)) / Math.PI) / 2 * span,
    };

}
function fit ( points: readonly Point[], width: number, height: number, limit: number ): View {

    for ( let zoom = limit; zoom >= shallowest; zoom -= 1 ) {

        const spots = points.map(( point ) => project(point.latitude, point.longitude, zoom));
        const xs = spots.map(( spot ) => spot.x);
        const ys = spots.map(( spot ) => spot.y);
        const [west, east, north, south] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];

        if ( zoom === shallowest || (east - west <= width - pad * 2 && south - north <= height - pad * 2) ) {

            return { zoom, left: (west + east) / 2 - width / 2, top: (north + south) / 2 - height / 2, width, height };

        }

    }

    return { zoom: shallowest, left: 0, top: 0, width, height };

}
function spread ( points: readonly Point[], view: View ) {

    const placed: { point: Point; x: number; y: number }[] = [];

    for ( const point of points ) {

        const spot = project(point.latitude, point.longitude, view.zoom);
        const x = spot.x - view.left;
        let y = spot.y - view.top;

        const crowded = () => placed.some(( other ) => (
            other.point.kind !== "dot" && Math.abs(other.x - x) < 76 && Math.abs(other.y - y) < 30
        ));

        for ( let tries = 0; point.kind !== "dot" && tries < 6 && crowded(); tries += 1 ) {

            y += 32;

        }

        placed.push({ point, x, y });

    }

    return placed;

}
function source ( template: string, zoom: number, x: number, y: number ): string {

    const span = 2 ** zoom;
    const column = ((x % span) + span) % span;

    return template.replace("{s}", subdomains[(column + y) % subdomains.length] ?? "a")
        .replace("{z}", String(zoom)).replace("{x}", String(column)).replace("{y}", String(y));

}
export default function TileMap ({ label, credit, tiles, points, size = "full", link }: Props) {

    const frame = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<View | null>(null);

    useEffect(() => {

        const node = frame.current;

        if ( !node || !points.length ) return;

        const measure = () => setView(fit(points, node.clientWidth, node.clientHeight, deepest[size]));
        const observer = new ResizeObserver(measure);

        measure();
        observer.observe(node);

        return () => observer.disconnect();

    }, [points, size]);

    const cells = view ? (() => {

        const span = 2 ** view.zoom;
        const list: { key: string; x: number; y: number }[] = [];

        const rows = [Math.max(0, Math.floor(view.top / side)), Math.min(span - 1, Math.floor((view.top + view.height) / side))];
        const columns = [Math.floor(view.left / side), Math.floor((view.left + view.width) / side)];

        for ( let y = rows[0] ?? 0; y <= (rows[1] ?? 0); y += 1 ) {

            for ( let x = columns[0] ?? 0; x <= (columns[1] ?? 0); x += 1 ) {

                list.push({ key: `${x}-${y}`, x, y });

            }

        }

        return list;

    })() : [];

    return (

        <section aria-label={label} className="tile-map" data-size={size} dir="ltr">

            <div ref={frame} className="tile-map-frame" data-ready={view ? "" : undefined}>

                {view ? cells.map(( cell ) => (

                    <span
                        key={cell.key} className="tile-map-cell" style={{ left: cell.x * side - view.left, top: cell.y * side - view.top }}
                    >

                        <picture className="contents">

                            <img src={source(tiles, view.zoom, cell.x, cell.y)} alt="" draggable={false} />

                        </picture>

                    </span>

                )) : null}

                {view ? spread(points, view).map(( { point, x, y } ) => {

                    const body = (

                        <>

                            {point.kind === "dot" ? <span className="map-pin-dot" /> : <span className="map-pin-label">{point.label}</span>}

                            <span aria-hidden="true" className="map-preview">

                                {point.image ? (

                                    <picture className="contents"><img src={point.image} alt="" className="map-preview-image" /></picture>

                                ) : null}

                                <span className="map-preview-title" dir="auto">{point.title}</span>

                                {point.meta ? <span className="map-preview-meta" dir="auto">{point.meta}</span> : null}

                            </span>

                        </>

                    );

                    return (

                        <span key={point.key} className="map-pin" data-kind={point.kind ?? "label"} style={{ left: x, top: y }}>

                            {point.href ? (

                                <NextLink
                                    href={point.href as Route} prefetch={false} aria-label={`${point.title}, ${point.label}`}
                                    className="map-pin-body"
                                >

                                    {body}

                                </NextLink>

                            ) : <span className="map-pin-body">{body}</span>}

                        </span>

                    );

                }) : null}

            </div>

            {link ? (

                <a href={link.href} target="_blank" rel="noopener" className="tile-map-link">

                    <span className="sr-only">{link.label}</span>

                    <span aria-hidden="true" className="tile-map-chip" data-glyph={link.glyph ? "" : undefined}>

                        {link.glyph ?? link.label}

                    </span>

                </a>

            ) : null}

            <small className="tile-map-credit">{credit}</small>

        </section>

    );

}
