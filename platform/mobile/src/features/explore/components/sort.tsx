import { useTranslation } from "react-i18next";
import { Choice } from "@/components/choice";
import { Sheet } from "@/elements/sheet";
import type { SearchSort } from "@/model/search";

type SearchSortProps = {
    open: boolean;
    value: SearchSort;
    options: readonly SearchSort[];
    onSelect: ( value: SearchSort ) => void;
    onClose: () => void;
};

export function SearchSortSheet ({ open, value, options, onSelect, onClose }: SearchSortProps) {

    const { t } = useTranslation();

    return (
        <Sheet open={open} onClose={onClose} title={t("search.sortTitle")} scroll>
            {options.map(( option ) => (
                <Choice
                    key={option}
                    kind="radio"
                    label={t(`search.sorts.${ option }`)}
                    selected={value === option}
                    onPress={() => onSelect(option) }
                />
            ))}
        </Sheet>
    );

}
