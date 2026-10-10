import { Box } from "@/elements/box";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export function SeparatorLabel ({ label }: { label: string }) {

    const size = useTheme().composition.separator.size;

    return (
        <Box align="center">
            <Box plane="base" curve="pill" align="center" justify="center" style={{ width: size, height: size }}>
                <Text rank="label" ink="soft" align="center">{label}</Text>
            </Box>
        </Box>
    );

}
