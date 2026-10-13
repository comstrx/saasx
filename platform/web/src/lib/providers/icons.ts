import { Bell, Camera, Check, ChevronLeft, ChevronRight, Circle, House, Image, KeyRound, LayoutGrid, type LucideIcon, MapPin, Menu, Pencil, Plus, Search, SlidersHorizontal, Tag, Trash2, Undo2, UserRound } from "lucide-react";

export type Glyph = LucideIcon;

export const glyphs = {
    house: House,
    grid: LayoutGrid,
    key: KeyRound,
    tag: Tag,
    sliders: SlidersHorizontal,
    plus: Plus,
    pencil: Pencil,
    trash: Trash2,
    undo: Undo2,
    user: UserRound,
    pin: MapPin,
    camera: Camera,
    bell: Bell,
    search: Search,
    menu: Menu,
    circle: Circle,
    chevronStart: ChevronLeft,
    chevronEnd: ChevronRight,
    check: Check,
    image: Image,
} satisfies Record<string, LucideIcon>;

export const iconNames: readonly string[] = Object.keys(glyphs);
export type IconName = keyof typeof glyphs;

export const fallback: LucideIcon = Circle;
