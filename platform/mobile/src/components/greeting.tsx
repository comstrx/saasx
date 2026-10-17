import Heading from "@/elements/heading";

type Props = { text: string; primary: boolean };

export default function Greeting ({ text, primary }: Props) {

    return <Heading level={primary ? 1 : 2} text={text} />;

}
