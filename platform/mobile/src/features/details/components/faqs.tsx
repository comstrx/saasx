import { View } from "react-native";
import { Accordion } from "@/elements/accordion";
import { Divider } from "@/elements/divider";
import { Text } from "@/elements/text";
import type { Faq } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

export function Faqs ({ items }: { items: readonly Faq[] }) {

    const theme = useTheme();

    return (
        <View style={{ marginVertical: -theme.space["4"] }}>
            {items.map(( item, slot ) => (
                <View key={item.key}>
                    {slot > 0 ? <Divider /> : null}

                    <Accordion title={item.question}>
                        <Text rank="body" ink="soft">{item.answer}</Text>
                    </Accordion>
                </View>
            ))}
        </View>
    );

}
