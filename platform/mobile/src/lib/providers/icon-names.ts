export const iconNames = ["house", "grid", "key", "tag", "sliders", "plus", "pencil", "trash", "undo", "user", "pin", "camera", "bell", "search", "menu", "circle", "chevronStart", "chevronEnd", "check", "image"] as const;

export type IconName = (typeof iconNames)[number];
