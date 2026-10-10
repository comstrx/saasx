import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Skeleton } from "@/elements/skeleton";
import { CheckoutSection } from "@/features/checkout/components/section";
import { useTheme } from "@/theme/use-theme";

export function CheckoutLoading () {

    const theme = useTheme();

    return (
        <>
            <CheckoutSection>
                <Box align="stretch" row gap="4">
                    <Skeleton curve="tile" width={theme.art.md} height={theme.art.md} />
                    <Box gap="3" style={styles.copy}>
                        <Skeleton curve="tag" height={theme.text.heading.latin.height} />
                        <Skeleton curve="tag" width="78%" height={theme.text.caption.latin.height} />
                        <Skeleton curve="tag" width="54%" height={theme.text.caption.latin.height} />
                    </Box>
                </Box>
            </CheckoutSection>

            {[ 0, 1, 2 ].map(( slot ) => (
                <CheckoutSection key={slot}>
                    <Skeleton curve="tag" width="48%" height={theme.tag.md} />
                    <Skeleton curve="card" height={theme.control.lg.height} />
                    <Skeleton curve="card" height={theme.control.lg.height} />
                </CheckoutSection>
            ))}
        </>
    );

}

const styles = StyleSheet.create({

    copy: { flex: 1 },

});
