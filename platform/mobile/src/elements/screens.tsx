import type { ReactNode } from "react";
import { Platform, StyleSheet } from "react-native";
import { ScreenStack, ScreenStackItem } from "@/lib/providers/screens";

type Card = { key: string; blocked: boolean; children: ReactNode };
type Props = { cards: readonly Card[]; onDismissed: ( key: string ) => void; onRefused: () => void };

const hidden = { hidden: true } as const;
const web = Platform.OS === "web";
const styles = StyleSheet.create({ stack: { flex: 1 } });

export default function Screens ({ cards, onDismissed, onRefused }: Props) {

    const top = cards.length - 1;

    return (

        <ScreenStack style={styles.stack}>

            {cards.map(( card, index ) => (

                <ScreenStackItem
                    key={card.key}
                    screenId={card.key}
                    activityState={web && index !== top ? 0 : 2}
                    style={StyleSheet.absoluteFill}
                    headerConfig={hidden}
                    stackPresentation="push"
                    shouldFreeze={index < top - 1}
                    nativeBackButtonDismissalEnabled={false}
                    preventNativeDismiss={card.blocked}
                    onDismissed={() => onDismissed(card.key)}
                    onNativeDismissCancelled={onRefused}
                >

                    {card.children}

                </ScreenStackItem>

            ))}

        </ScreenStack>

    );

}
