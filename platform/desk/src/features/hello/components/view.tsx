import Greeting from "@/components/greeting";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { text: string };

export default function View ({ options, feature }: FeatureProps<Options>) {

    return <Greeting text={options.text} primary={feature?.heading ?? false} />;

}
