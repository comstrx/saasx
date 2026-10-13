import Button from "@/elements/button";
import Card from "@/elements/card";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { greeting: string; detail?: string | undefined; logout: string; busy: boolean; onLogout: () => void };

export default function AccountCard ({ greeting, detail, logout, busy, onLogout }: Props) {

    return (

        <Card>

            <Stack direction="row" gap={3} align="between">

                <Stack gap={1}>

                    <Text text={greeting} size="lg" />

                    {detail ? <Text text={detail} tone="muted" size="sm" /> : null}

                </Stack>

                <Button label={logout} tone="ghost" busy={busy} onPress={onLogout} />

            </Stack>

        </Card>

    );

}
