import Button from "@/elements/button";

type Props = { label: string; onClick: () => void; pending?: boolean };

export default function FormAction ({ label, onClick, pending }: Props) {

    return <Button variant="outlined" width="full" pending={pending} onClick={onClick}>{label}</Button>;

}
