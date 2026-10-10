"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Stack from "@/elements/stack";

type Props = { id: string; message: string; label: string; pending?: boolean; onRetry: () => void };

export default function FormRetry ({ id, message, label, pending, onRetry }: Props) {

    return (

        <Stack gap={4}>

            <FormFeedback id={id} error={message} />
            <Button variant="outlined" width="full" pending={pending} onClick={onRetry}>{label}</Button>

        </Stack>

    );

}
