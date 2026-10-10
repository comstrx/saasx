import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";
import AccessPanel from "./access-panel";

type Props = {
    title: string; description: string; href: string; label: string; art?: string; level?: 1 | 2;
    register?: { href: string; label: string } | null;
};

export default function SignInPrompt ({ title, description, href, label, art, level = 2, register }: Props) {

    return (

        <AccessPanel title={title} description={description} art={art} level={level}>

            <Stack gap={3}>

                <Link href={href} variant="filled" size="large" width="full"><Icon name="sign-in" />{label}</Link>

                {register ? <Link href={register.href} variant="outlined" size="large" width="full">{register.label}</Link> : null}

            </Stack>

        </AccessPanel>

    );

}
