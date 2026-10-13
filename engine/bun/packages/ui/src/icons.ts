/// <reference path="./lucide.d.ts" />

import bell from "lucide/dist/esm/icons/bell.mjs";
import camera from "lucide/dist/esm/icons/camera.mjs";
import check from "lucide/dist/esm/icons/check.mjs";
import chevronStart from "lucide/dist/esm/icons/chevron-left.mjs";
import chevronEnd from "lucide/dist/esm/icons/chevron-right.mjs";
import circle from "lucide/dist/esm/icons/circle.mjs";
import house from "lucide/dist/esm/icons/house.mjs";
import image from "lucide/dist/esm/icons/image.mjs";
import key from "lucide/dist/esm/icons/key-round.mjs";
import grid from "lucide/dist/esm/icons/layout-grid.mjs";
import pin from "lucide/dist/esm/icons/map-pin.mjs";
import menu from "lucide/dist/esm/icons/menu.mjs";
import pencil from "lucide/dist/esm/icons/pencil.mjs";
import plus from "lucide/dist/esm/icons/plus.mjs";
import search from "lucide/dist/esm/icons/search.mjs";
import sliders from "lucide/dist/esm/icons/sliders-horizontal.mjs";
import tag from "lucide/dist/esm/icons/tag.mjs";
import trash from "lucide/dist/esm/icons/trash.mjs";
import undo from "lucide/dist/esm/icons/undo-2.mjs";
import user from "lucide/dist/esm/icons/user-round.mjs";

export type IconNode = readonly (readonly [string, Record<string, string | number>])[];
export const iconNames = [
    "house",
    "grid",
    "key",
    "tag",
    "sliders",
    "plus",
    "pencil",
    "trash",
    "undo",
    "user",
    "pin",
    "camera",
    "bell",
    "search",
    "menu",
    "circle",
    "chevronStart",
    "chevronEnd",
    "check",
    "image",
] as const;
export type IconName = (typeof iconNames)[number];
export const glyphs: Record<IconName, IconNode> = {
    house,
    grid,
    key,
    tag,
    sliders,
    plus,
    pencil,
    trash,
    undo,
    user,
    pin,
    camera,
    bell,
    search,
    menu,
    circle,
    chevronStart,
    chevronEnd,
    check,
    image,
};
export type Icons<I> = {
    readonly names: readonly string[];
    has: ( name: string ) => boolean;
    get: ( name: string ) => I;
};

export function createIcons<I> ( set: Readonly<Record<string, I>>, fallback: I ): Icons<I> {

    const names = Object.keys(set).sort();

    return {
        names,
        has: ( name ) => Object.hasOwn(set, name),
        get: ( name ) => (Object.hasOwn(set, name) ? (set[name] as I) : fallback),
    };

}
