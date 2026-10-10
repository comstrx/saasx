import Alert from "@/elements/alert";

type Props = { id: string; error?: string | null; message?: string | null; hidden?: boolean };

export default function FormFeedback ({ id, error, message, hidden = false }: Props) {

    const content = error ?? message;

    return (

        <Alert id={id} tone={error ? "danger" : "success"} size="compact" live focusable hidden={hidden || !content}>

            {content}

        </Alert>

    );

}
