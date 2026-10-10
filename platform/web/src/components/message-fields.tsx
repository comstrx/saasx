import Field from "@/elements/field";
import Stack from "@/elements/stack";
import Textarea from "@/elements/textarea";

type Props = {
    title?: string; content: string; hint?: string; values: { title: string; content: string };
    errors: Record<string, string>; disabled?: boolean; id: ( key: string ) => string;
    onChange: ( patch: Partial<{ title: string; content: string }> ) => void;
};

export default function MessageFields ({ title, content, hint, values, errors, disabled, id, onChange }: Props) {

    return (

        <Stack gap={4}>

            {title ? <Field id={id("title")} label={title} value={values.title} maxLength={255} dir="auto"
                disabled={disabled} error={errors.title} onChange={( event ) => onChange({ title: event.target.value })} /> : null}
            <Textarea id={id("content")} label={content} hint={hint} value={values.content} maxLength={65535} rows={3} dir="auto"
                disabled={disabled} error={errors.content} onChange={( event ) => onChange({ content: event.target.value })} />

        </Stack>

    );

}
