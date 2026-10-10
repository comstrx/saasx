import Button from "@/elements/button";
import Icon from "@/icons/icon";

type Props = { claimed: boolean; disabled?: boolean; labels: { claim: string; saved: string }; onClaim: () => void };

export default function ClaimButton ({ claimed, disabled, labels, onClaim }: Props) {

    return (

        <Button variant={claimed ? "subtle" : "outlined"} size="small" rounded="full" disabled={disabled || claimed} onClick={onClaim}>

            <Icon name={claimed ? "check" : "plus"} />{claimed ? labels.saved : labels.claim}

        </Button>

    );

}
