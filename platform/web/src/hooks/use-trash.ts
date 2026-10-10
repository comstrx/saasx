"use client";

import { useState } from "react";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

export type Trashable = "comments" | "orders" | "referrals" | "replies" | "reports" | "reviews" | "transactions";

function single ( feature: Trashable, id: number ) {

    return {
        comments: { commentId: id }, orders: { orderId: id }, referrals: { referralId: id }, replies: { replyId: id },
        reports: { reportId: id }, reviews: { reviewId: id }, transactions: { transactionId: id },
    }[feature];

}
export function useTrash ( feature: Trashable, reload: () => void ) {

    const t = useTranslations("trash");
    const toast = useToast();
    const remove = useAction(feature, "remove");
    const restore = useAction(feature, "restore");
    const removeMany = useAction(feature, "removeMany");
    const restoreMany = useAction(feature, "restoreMany");
    const [selected, setSelected] = useState<number[]>([]);
    const pending = remove.pending || removeMany.pending;

    async function hide ( id: number ) {

        if ( pending ) return false;

        if ( !(await remove.run(single(feature, id))) ) {

            toast({ title: t("failed"), tone: "error" });
            return false;

        }

        reload();
        toast({
            title: t("removed"), tone: "success",
            action: {
                label: t("undo"),
                onClick: () => { void restore.run(single(feature, id)).then(( back ) => { if ( back ) reload(); }); },
            },
        });

        return true;

    }
    async function hideSelected () {

        const ids = [...selected];

        if ( !ids.length || pending ) return;

        if ( !(await removeMany.run({ ids })) ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        setSelected([]);
        reload();
        toast({
            title: t("removedMany", { count: ids.length }), tone: "success",
            action: {
                label: t("undo"),
                onClick: () => { void restoreMany.run({ ids }).then(( back ) => { if ( back ) reload(); }); },
            },
        });

    }

    return {
        hide, hideSelected, pending,
        selection: {
            ids: selected,
            pick: ( id: number, value: boolean ) => setSelected(( current ) => (
                value ? [...new Set([...current, id])] : current.filter(( entry ) => entry !== id)
            )),
            all: ( ids: readonly number[] ) => setSelected(( current ) => (current.length === ids.length ? [] : [...ids])),
            clear: () => setSelected([]),
            labels: {
                select: ( title: string ) => t("select", { title }), count: t("selected", { count: selected.length }),
                remove: t("removeSelected"), clear: t("clearSelection"), all: t("selectAll"),
            },
        },
    };

}
