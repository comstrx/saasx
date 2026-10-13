import type { SpecText } from "./fields.ts";
import type { Access } from "./shapes.ts";

export type MenuItem = { name: string; path: string; title: SpecText; icon: string | null; access: Access };

type MenuScreen = {
    name: string;
    path: string;
    title: SpecText;
    icon?: string | null | undefined;
    access: Access;
    options: Record<string, unknown>;
};

export function menuOf ( screens: readonly MenuScreen[], part: string ): MenuItem[] {

    return screens
        .filter(( screen ) => screen.options[part] === true && !screen.path.includes(":") && screen.access !== "guest")
        .map(({ name, path, title, icon, access }) => ({ name, path, title, icon: icon ?? null, access }));

}
