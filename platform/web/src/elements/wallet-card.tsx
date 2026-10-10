import type { ReactNode } from "react";

type Props = { brand: string; label: string; amount: ReactNode; holder: string; caption?: string | null; mark?: ReactNode };

export default function WalletCard ({ brand, label, amount, holder, caption, mark }: Props) {

    return (

        <div className="wallet-card">

            <div className="wallet-card-top">

                <span className="wallet-card-brand">{mark}{brand}</span>

                <span aria-hidden="true" className="wallet-card-chip" />

            </div>

            <div className="wallet-card-balance">

                <span className="wallet-card-label">{label}</span>

                <span className="wallet-card-amount">{amount}</span>

            </div>

            <div className="wallet-card-bottom">

                <span className="wallet-card-holder" dir="auto">{holder}</span>

                {caption ? <span className="wallet-card-caption">{caption}</span> : null}

            </div>

        </div>

    );

}
