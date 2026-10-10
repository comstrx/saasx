import SpecList from "@/elements/spec-list";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Rule = { key: string; term: string; detail: string; icon?: string };
type Props = { id?: string; title: string; description?: string; items: readonly Rule[] };

export default function RulesPanel ({ id, title, description, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Section id={id} title={title} description={description}>

            <SpecList items={items.map(( item ) => ({ ...item, icon: isIconName(item.icon) ? <Icon name={item.icon} /> : undefined }))} />

        </Section>

    );

}
