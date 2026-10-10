import Accordion from "@/elements/accordion";
import RichText from "@/elements/rich-text";
import Icon from "@/icons/icon";
import Section from "./section";

type Props = { id?: string; title: string; items: readonly { key: string; title: string; body: string }[] };

export default function FaqList ({ id, title, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Section id={id} title={title}>

            <Accordion
                look="panel"
                multiple={false}
                items={items.map(( item ) => ({ ...item, icon: <Icon name="question" size="md" />, body: <RichText value={item.body} /> }))}
            />

        </Section>

    );

}
