import type { ReactNode } from "react";

type Props = { name: string; onSubmit: () => void; children: ReactNode };

export default function Form ({ name, onSubmit, children }: Props) {

    const submit = ( event: { preventDefault: () => void } ): void => {

        event.preventDefault();
        onSubmit();

    };

    return <form className="form" data-name={name} onSubmit={submit} noValidate>{children}</form>;

}
