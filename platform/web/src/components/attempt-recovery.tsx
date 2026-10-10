import Button from "@/elements/button";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = {
    title: string; description: string; label: string; summary?: string;
    pending?: boolean; blocked?: boolean; onRetry: () => void;
};

export default function AttemptRecovery ({ title, description, label, summary, pending, blocked, onRetry }: Props) {

    return (

        <Stack gap={4}>

            <Heading size="h3">{title}</Heading>
            {summary ? <Text weight="semibold">{summary}</Text> : null}
            <Text size="small" tone="muted" role="status">{description}</Text>
            {!blocked ? <Button width="full" size="large" pending={pending} onClick={onRetry}>{label}</Button> : null}

        </Stack>

    );

}
