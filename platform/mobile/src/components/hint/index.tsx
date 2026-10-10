import { Callout } from "@/elements/callout";
import type { IconName } from "@/elements/icon";

type HintProps = {
    icon: IconName;
    text: string;
};

export function Hint ({ icon, text }: HintProps) {

    return <Callout tint="brand" icon={icon} body={text} />;

}
