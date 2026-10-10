import WelcomeDialog from "@/components/welcome-dialog";

type Props = {
    art: string; title: string; body: string; start: string; later: string; close: string;
    benefits: readonly { icon: string; text: string }[];
};

export default function Welcome ({ art, ...props }: Props) {

    return <WelcomeDialog art={`/assets/images/brand/${art}.webp`} {...props} />;

}
