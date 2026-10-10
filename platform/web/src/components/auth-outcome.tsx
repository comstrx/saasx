import type { ReactNode } from "react";
import FormLinks from "@/components/form-links";
import FormPanel from "@/components/form-panel";
import Text from "@/elements/text";

type Props = { title: string; message: string; art?: string; links: readonly { href: string; label: string }[]; action?: ReactNode };

export default function AuthOutcome ({ title, message, art, links, action }: Props) {

    return (

        <FormPanel title={title} art={art} footer={<FormLinks links={links} />}>

            <Text role="status" tone="muted">{message}</Text>
            {action}

        </FormPanel>

    );

}
