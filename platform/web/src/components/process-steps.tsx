import Steps from "@/elements/steps";
import Section from "./section";

type Props = { id?: string; title: string; items: readonly { key: string; title: string; body?: string }[]; direction?: "column" | "row" };

export default function ProcessSteps ({ id, title, items, direction = "row" }: Props) {

    return (

        <Section id={id} title={title}>

            <Steps label={title} items={items} direction={direction} />

        </Section>

    );

}
