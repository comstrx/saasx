import type { ReactNode } from "react";
import Button from "@/elements/button";
import Image from "@/elements/image";
import Stack from "@/elements/stack";
import Icon from "@/icons";
import ActionCard, { type Note } from "./action-card";

type Props = { title: string; alt: string; image: string | null | undefined; status?: ReactNode | undefined; pick: string; camera: string; busy: boolean; note?: Note | undefined; onPick: ( source: "library" | "camera" ) => void };

export default function AvatarCard ({ title, alt, image, status, pick, camera, busy, note, onPick }: Props) {

    return (

        <ActionCard icon="user" title={title} note={note}>

            {status ?? <Image src={image} alt={alt} ratio="square" />}

            <Stack direction="row" gap={2}>

                <Button label={pick} busy={busy} icon={<Icon name="image" size="sm" />} onPress={() => onPick("library")} />

                <Button label={camera} tone="ghost" busy={busy} icon={<Icon name="camera" size="sm" />} onPress={() => onPick("camera")} />

            </Stack>

        </ActionCard>

    );

}
