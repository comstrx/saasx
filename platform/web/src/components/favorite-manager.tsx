"use client";

import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Check from "@/elements/check";
import Dialog from "@/elements/dialog";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useFavoriteManager } from "@/hooks/use-favorite-manager";
import { useLocale } from "@/lib/providers/intl";
import { entityLink } from "@/lib/spec/browser";
import { routing } from "@/lib/spec/config";
import { favoriteTarget } from "@/lib/std/favorites";
import { day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import FormFeedback from "./form-feedback";
import SavedItem from "./saved-item";

type Props = { items: readonly Data<"favorites", "view">[]; loading?: boolean };

export default function FavoriteManager ({ items, loading = false }: Props) {

    const state = useFavoriteManager(items, loading);
    const { t } = state;
    const locale = useLocale();

    if ( !items.length && !state.removal ) return <FormFeedback id={state.id} message={state.message} />;

    return (

        <Stack gap={4}>

            <FormFeedback id={state.id} message={state.message} />
            {state.allowed && items.length ? <Stack direction="row" justify="between" align="center" gap={3} wrap>

                <Check id={`${state.id}-page`} label={t("selectPage")} checked={state.selected.length === items.length}
                    indeterminate={state.selected.length > 0 && state.selected.length < items.length}
                    disabled={loading || state.pending} onChange={state.selectPage} />
                <Stack direction="row" align="center" gap={3} wrap>

                    <Text size="small" tone="muted">{t("selected", { count: state.selected.length })}</Text>
                    <Button variant="outlined" disabled={loading || state.pending || !state.selected.length}
                        onClick={() => state.ask({ ids: state.selected, single: false })}>{t("removeSelected")}</Button>

                </Stack>

            </Stack> : null}
            <Grid columns="auto" gap={5} label={t("list")}>

                {items.map(( row ) => {

                    const { item, kind, entity } = favoriteTarget(row);
                    const name = item?.name || (kind === "blog" ? row.blog?.title : null) || t("unavailableItem");
                    const href = item && entity ? entityLink(entity, item) : null;
                    const date = row.created_at ? day(row.created_at, locale, { day: "numeric", month: "short", year: "numeric" }) : "";

                    return <SavedItem
                        key={row.id} title={name} kind={t(`groups.${kind}`)} image={item?.image}
                        href={href ? localePath(locale, href, routing) : null}
                        date={date ? t("savedOn", { date }) : undefined}
                        unavailable={!item ? t("unavailableBody") : !href ? t("linkUnavailable") : undefined}
                        disabled={loading || state.pending}
                        selection={state.allowed ? <Check id={`${state.id}-${row.id}`}
                            label={t("select", { name })} labelVisible={false} checked={state.selected.includes(row.id)}
                            disabled={loading || state.pending} onChange={( checked ) => state.select(row.id, checked)} /> : undefined}
                        remove={state.allowed ? {
                            label: t("remove", { name }),
                            onClick: () => state.ask({ ids: [row.id], single: true, name }),
                        } : undefined}
                    />;

                })}

            </Grid>
            <Dialog open={!!state.removal} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={t("removeTitle")} close={t("cancel")} dismissible={!state.pending}>

                <Stack gap={4}>

                    <Text tone="muted" size="small">{state.removal?.single ? t("removeOne", { name: state.removal.name ?? "" })
                        : t("removeMany", { count: state.removal?.ids.length ?? 0 })}</Text>
                    <FormFeedback id={`${state.id}-error`} error={!state.allowed ? t("actionDenied") : state.error} />
                    <Button variant="outlined" disabled={state.pending} onClick={state.close}>{t("cancel")}</Button>
                    <Button pending={state.pending} disabled={!state.allowed} onClick={() => { void state.remove(); }}>
                        {t(state.error ? "retry" : "confirmRemove")}
                    </Button>

                </Stack>

            </Dialog>

        </Stack>

    );

}
