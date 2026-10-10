import Loader from "@/elements/loader";

type Props = { label: string; layout?: "screen" | "block" | "inline" };

export default function PageLoader ({ label, layout = "block" }: Props) {

    return <Loader label={label} layout={layout} />;

}
