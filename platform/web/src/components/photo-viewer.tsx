"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Gallery from "@/elements/gallery";
import Media from "@/elements/media";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { usePhotoViewer } from "@/hooks/use-photo-viewer";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    pictures: readonly { src: string; srcSet?: string; alt: string; label: string }[];
    labels: { title: string; show: string; close: string; previous: string; next: string };
    direction: "ltr" | "rtl";
    layout?: "mosaic" | "booking" | "showcase";
    phone?: boolean;
};

export default function PhotoViewer ({ pictures, labels, direction, layout = "mosaic", phone = true }: Props) {

    const t = useTranslations("detail");
    const view = usePhotoViewer(pictures.length);
    const current = pictures[view.index];

    if ( !current ) return null;

    const gallery = (

        <Gallery
            pictures={pictures}
            label={labels.title}
            layout={layout}
            more={( count ) => t("morePhotos", { count })}
            action={<><Icon name="images" size="sm" />{labels.show}</>}
            onSelect={view.select}
        />

    );

    return (

        <>

            {phone ? gallery : <Stack visibility="tablet">{gallery}</Stack>}

            <Dialog open={view.open} onOpenChange={view.setOpen} title={labels.title} close={labels.close} finalFocus={view.trigger} wide>

                <Stack
                    gap={4}
                    onKeyDown={( event ) => {

                        if ( event.key !== "ArrowLeft" && event.key !== "ArrowRight" ) return;

                        event.preventDefault();
                        view.move((event.key === "ArrowRight" ? 1 : -1) * (direction === "rtl" ? -1 : 1));

                    }}
                >

                    <Media src={current.src} alt={current.alt} fit="contain" ratio="viewer" priority />

                    <Stack direction="row" justify="between" align="center" gap={3}>

                        <Button
                            variant="outlined"
                            icon
                            rounded="full"
                            aria-label={labels.previous}
                            disabled={view.index === 0}
                            onClick={() => view.move(-1)}
                        >

                            <Icon name="caret-start" weight="bold" />

                        </Button>

                        <Text size="small" numeric role="status">{current.label}</Text>

                        <Button
                            variant="outlined"
                            icon
                            rounded="full"
                            aria-label={labels.next}
                            disabled={view.index === pictures.length - 1}
                            onClick={() => view.move(1)}
                        >

                            <Icon name="caret-end" weight="bold" />

                        </Button>

                    </Stack>

                </Stack>

            </Dialog>

        </>

    );

}
