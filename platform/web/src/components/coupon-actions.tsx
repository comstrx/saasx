import Button from "@/elements/button";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";
import ClaimButton from "./claim-button";

type Props = {
    claim?: { claimed: boolean; disabled?: boolean; labels: { claim: string; saved: string }; onClaim: () => void } | null;
    details: { label: string; onOpen: () => void };
};

export default function CouponActions ({ claim, details }: Props) {

    return (

        <Stack direction="row" align="center" gap={2} wrap>

            {claim ? <ClaimButton {...claim} /> : null}

            <Button variant="ghost" size="small" rounded="full" onClick={details.onOpen}><Icon name="info" />{details.label}</Button>

        </Stack>

    );

}
