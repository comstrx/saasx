import Text from "@/elements/text";

export default function Note ({ text }: { text: string }) {
    return <Text text={text} tone="muted" size="sm" />;
}
