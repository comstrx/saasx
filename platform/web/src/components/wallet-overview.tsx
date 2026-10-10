import type { ReactNode } from "react";
import Amount from "@/elements/amount";
import Columns from "@/elements/columns";
import Divider from "@/elements/divider";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import WalletCard from "@/elements/wallet-card";
import Icon, { type IconName, isIconName } from "@/icons/icon";
import type { Money } from "@/lib/std/format";
import StatTile from "./stat-tile";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    currencyLabel: string;
    holder: string;
    balance: { available?: Money; pending?: Money; total?: Money; points: string };
    stats: readonly { key: string; label: string; icon: string; amount?: Money }[];
    labels: {
        available: string; pending: string; total: string; points: string; card: string; stats: string; manage: string; manageBody: string;
    };
    actions: ReactNode;
};

const tones: Readonly<Record<string, Tone>> = { deposits: "green", pays: "ember", refunds: "blue", cashback: "amber", referrals: "teal" };

export default function WalletOverview ({ currencyLabel, holder, balance, stats, labels, actions }: Props) {

    const rows = [
        { key: "pending", label: labels.pending, money: balance.pending },
        { key: "total", label: labels.total, money: balance.total },
    ];

    return (

        <Stack gap={5}>

            <Surface padding={8} radius="hero" elevation="medium">

                <Columns
                    ratio="5:7"
                    gap={8}
                    align="stretch"
                    start={(

                        <WalletCard
                            brand={labels.card}
                            mark={<Icon name="wallet" weight="fill" />}
                            label={labels.available}
                            amount={balance.available ? (

                                <Amount {...balance.available} currencyLabel={currencyLabel} size="hero" tone="inherit" />

                            ) : "—"}
                            holder={holder}
                            caption={balance.available?.currency ?? null}
                        />

                    )}
                    end={(

                        <Stack gap={6} justify="center" fill>

                            <Stack gap={1}>

                                <Text size="title" weight="semibold">{labels.manage}</Text>

                                <Text size="small" tone="muted">{labels.manageBody}</Text>

                            </Stack>

                            <Stack direction="row" gap={2} wrap>{actions}</Stack>

                            <Divider />

                            <Stack direction="row" gap={8} wrap>

                                {rows.map(( item ) => (

                                    <Stack key={item.key} gap={1}>

                                        <Text size="small" tone="muted">{item.label}</Text>

                                        {item.money ? (

                                            <Amount {...item.money} currencyLabel={currencyLabel} size="title" />

                                        ) : <Text>—</Text>}

                                    </Stack>

                                ))}

                                <Stack gap={1}>

                                    <Text size="small" tone="muted">{labels.points}</Text>

                                    <Text size="title" weight="bold" numeric>{balance.points}</Text>

                                </Stack>

                            </Stack>

                        </Stack>

                    )}
                />

            </Surface>

            {stats.length ? (

                <Grid as="ul" columns="stats" gap={4} label={labels.stats}>

                    {stats.map(( stat ) => (

                        <StatTile
                            key={stat.key}
                            label={stat.label}
                            icon={(isIconName(stat.icon) ? stat.icon : "wallet") as IconName}
                            tone={tones[stat.key] ?? "teal"}
                            value={stat.amount ? <Amount {...stat.amount} currencyLabel={currencyLabel} size="base" /> : null}
                        />

                    ))}

                </Grid>

            ) : null}

        </Stack>

    );

}
