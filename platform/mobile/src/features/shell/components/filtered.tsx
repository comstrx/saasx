import { useTranslation } from "react-i18next";
import type { EmblemName } from "@/elements/emblem";
import { Empty } from "@/elements/empty";

type FilteredProps = {
    emblem: EmblemName;
    filter: string;
    all: string;
};

export function Filtered ({ emblem, filter, all }: FilteredProps) {

    const { t } = useTranslation();

    return <Empty emblem={emblem} title={t("common.filteredTitle", { filter })} note={t("common.filteredBody", { all })} />;

}
