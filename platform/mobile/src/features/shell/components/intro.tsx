import { type IntroProps, Intro as IntroView } from "@/components/intro";
import { useIntro } from "@/features/shell/hooks/use-intro";

type PageIntroProps = Omit<IntroProps, "open" | "onClose"> & {
    page: string;
    hold?: boolean | undefined;
};

export function Intro ({ page, hold, ...props }: PageIntroProps) {

    const visibility = useIntro(page, hold);

    return <IntroView {...props} {...visibility} />;

}
