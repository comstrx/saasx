import Button from "@/elements/button";
import Stack from "@/elements/stack";

type Props = { label: string; onClick: (() => void) | null };

export default function MoreButton ({ label, onClick }: Props) {

    if ( !onClick ) return null;

    return <Stack direction="row" justify="center"><Button variant="outlined" onClick={onClick}>{label}</Button></Stack>;

}
