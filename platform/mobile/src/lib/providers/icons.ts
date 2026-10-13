import { Bell, Camera, Check, ChevronLeft, ChevronRight, Circle, House, Image, KeyRound, LayoutGrid, type LucideIcon, MapPin, Menu, Pencil, Plus, Search, SlidersHorizontal, Tag, Trash2, Undo2, UserRound } from "lucide-react-native";
import type { IconName } from "./icon-names.ts";

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
} satisfies Record<IconName, LucideIcon>;
export const fallback: LucideIcon = Circle;
