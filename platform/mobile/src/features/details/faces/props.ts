import type { DetailPanel } from "@/features/details/components/panels";
import type { When } from "@/features/shell/hooks/use-when";
import type { Detail } from "@/model/detail";

export type DeckProps = {
    detail: Detail;
    picked: number | null;
    quantity: number;
    when: When;
    onPick: ( id: number ) => void;
    onQuantity: ( next: number ) => void;
    onPanel: ( panel: DetailPanel ) => void;
    onBook: () => void;
};
