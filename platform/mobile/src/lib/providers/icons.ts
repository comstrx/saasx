import type { LucideIcon } from "lucide-react-native";
import Bell from "lucide-react-native/icons/bell";
import Camera from "lucide-react-native/icons/camera";
import Check from "lucide-react-native/icons/check";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Circle from "lucide-react-native/icons/circle";
import House from "lucide-react-native/icons/house";
import Image from "lucide-react-native/icons/image";
import KeyRound from "lucide-react-native/icons/key-round";
import LayoutGrid from "lucide-react-native/icons/layout-grid";
import MapPin from "lucide-react-native/icons/map-pin";
import Menu from "lucide-react-native/icons/menu";
import Pencil from "lucide-react-native/icons/pencil";
import Plus from "lucide-react-native/icons/plus";
import Search from "lucide-react-native/icons/search";
import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";
import Tag from "lucide-react-native/icons/tag";
import Trash from "lucide-react-native/icons/trash";
import Undo2 from "lucide-react-native/icons/undo-2";
import UserRound from "lucide-react-native/icons/user-round";
import type { IconName } from "./icon-names.ts";

/**
 * One file per icon: Metro bundles whatever a module reaches, and the package index reaches every
 * icon there is (1.5 MB of the bundle before this).
 */
export type Glyph = LucideIcon;

export const glyphs = {
    house: House,
    grid: LayoutGrid,
    key: KeyRound,
    tag: Tag,
    sliders: SlidersHorizontal,
    plus: Plus,
    pencil: Pencil,
    trash: Trash,
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
