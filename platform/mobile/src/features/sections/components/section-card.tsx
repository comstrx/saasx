import { useTranslation } from "react-i18next";
import { Tile } from "@/components/tile";
import type { IconName } from "@/elements/icon";
import { glyphOf } from "@/features/catalog/marks";
import { branching, type Category } from "@/model/category";

type SectionCardProps = {
    category: Category;
    icon?: IconName | undefined;
    width?: number | undefined;
    onPress?: (() => void) | undefined;
};

export function SectionCard ({ category, icon, width, onPress }: SectionCardProps) {

    const { t } = useTranslation();

    const tally = branching(category)
        ? t("sections.groups", { count: category.children })
        : t("sections.holds", { count: category.catalogs });

    return (
        <Tile
            title={category.name}
            note={tally}
            image={category.image}
            icon={icon ?? ( category.icon ? glyphOf(category.icon) : "sections" )}
            width={width}
            shape="wide"
            onPress={onPress}
        />
    );

}
