import NavBar from "@/components/nav-bar";
import { useSession } from "@/hooks/use-session";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { brand: string; login: string; account: string };

export default function Menu ({ options }: FeatureProps<Options>) {
    const { ready, user } = useSession();
    const signedIn = ready && user !== null;

    return <NavBar brand={options.brand} action={signedIn ? { href: "/account", label: options.account } : { href: "/login", label: options.login }} />;
}
