"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import StateNotice from "@/components/state-notice";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import FileInput from "@/elements/file-input";
import Link from "@/elements/link";
import SettingRow from "@/elements/setting-row";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useAccountFiles } from "@/hooks/use-account-files";
import Icon, { isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { art: string };

export default function AccountFiles ({ art }: Props) {

    const data = useAccountFiles();
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Stack gap={5}>

            {data.failed ? (

                <FormRetry id="files-read" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : null}

            {data.loading ? <SectionSkeleton /> : null}

            {!data.loading && !data.failed && !data.items.length ? (

                <StateNotice art={art} title={t("emptyTitle")} description={t("emptyBody")} compact plain />

            ) : null}

            {data.items.length ? (

                <Stack as="ul" gap={0} aria-label={t("title")}>

                    {data.items.map(( item ) => (

                        <SettingRow
                            key={item.id}
                            media={<Emblem tone="blue" look="flat"><Icon name={isIconName(item.icon) ? item.icon : "file"} /></Emblem>}
                            title={<Text as="span" weight="semibold" dir="auto" wrap="anywhere">{item.name}</Text>}
                            description={item.size}
                            action={(

                                <>

                                    {item.href ? (

                                        <Link
                                            href={item.href}
                                            variant="ghost"
                                            size="small"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t("openNamed", { name: item.name })}
                                        >

                                            <Icon name="external" />{t("open")}

                                        </Link>

                                    ) : null}

                                    <Button
                                        variant="ghost"
                                        size="small"
                                        disabled={data.removing}
                                        aria-label={t("deleteNamed", { name: item.name })}
                                        onClick={() => data.ask({ id: item.id, name: item.name })}
                                    >

                                        <Icon name="trash" />{t("delete")}

                                    </Button>

                                </>

                            )}
                        />

                    ))}

                </Stack>

            ) : null}

            <Surface tone="track" border={false} elevation="none" radius="lg" padding={5}>

                <Stack gap={4}>

                    <FileInput
                        key={data.version}
                        id="account-files-input"
                        label={t("add")}
                        multiple
                        chooseLabel={t("choose")}
                        emptyLabel={t("nothingChosen")}
                        filename={data.picked}
                        hint={data.limit ? t("hint", { count: data.count, size: data.limit }) : undefined}
                        error={data.problem ?? undefined}
                        disabled={data.uploading}
                        onChange={( event ) => data.select(event.target.files)}
                    />

                    {data.chosen ? (

                        <Stack direction="row" gap={2} wrap>

                            <Button pending={data.uploading} disabled={!!data.problem} onClick={() => { void data.send(); }}>

                                <Icon name="upload" />{t("upload", { count: data.chosen })}

                            </Button>

                            <Button variant="ghost" disabled={data.uploading} onClick={data.reset}>{t("cancel")}</Button>

                        </Stack>

                    ) : null}

                </Stack>

            </Surface>

            <Dialog
                open={!!data.removal}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("deleteTitle")}
                close={t("cancel")}
                dismissible={!data.removing}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.removing} onClick={data.close}>{t("cancel")}</Button>

                        <Button variant="danger" pending={data.removing} onClick={() => { void data.erase(); }}>

                            <Icon name="trash" />{t("delete")}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Text tone="muted" wrap="pretty">{t("deleteBody")}</Text>

                    {data.removal ? <Text weight="semibold" dir="auto" wrap="anywhere">{data.removal.name}</Text> : null}

                    <FormFeedback id="files-remove-failure" error={data.removeError} />

                </Stack>

            </Dialog>

        </Stack>

    );

}
