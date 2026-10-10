import Grid from "@/elements/grid";
import Link from "@/elements/link";
import Icon, { isIconName } from "@/icons/icon";
import StateNotice from "./state-notice";

type Action = { key: string; href: string; label: string; icon: string | null };
type Props = { art: string; title: string; body: string; actions: readonly Action[] };

export default function MissingPage ({ art, title, body, actions }: Props) {

    return (

        <StateNotice
            level={1}
            art={art}
            title={title}
            description={body}
            action={actions.length ? (

                <Grid columns={2} mobileColumns={2} gap={2} as="div">

                    {actions.map(( action ) => (

                        <Link key={action.key} href={action.href} variant="outlined" size="medium" width="full">

                            {isIconName(action.icon) ? <Icon name={action.icon} tone="primary" /> : null}

                            {action.label}

                        </Link>

                    ))}

                </Grid>

            ) : null}
        />

    );

}
