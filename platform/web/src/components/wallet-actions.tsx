import Button from "@/elements/button";
import Icon from "@/icons/icon";

type Kind = "deposit" | "transfer" | "withdraw";
type Props = { labels: { add: string; send: string; withdraw: string }; onOpen: ( kind: Kind ) => void };

export default function WalletActions ({ labels, onOpen }: Props) {

    return (

        <>

            <Button rounded="full" onClick={() => onOpen("deposit")}><Icon name="plus" />{labels.add}</Button>

            <Button variant="outlined" rounded="full" onClick={() => onOpen("transfer")}><Icon name="share" />{labels.send}</Button>

            <Button variant="ghost" rounded="full" onClick={() => onOpen("withdraw")}><Icon name="payout" />{labels.withdraw}</Button>

        </>

    );

}
