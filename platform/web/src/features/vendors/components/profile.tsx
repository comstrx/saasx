import HostProfile from "@/components/host-profile";
import type { Route } from "@/lib/spec/feature";
import { profile } from "../hooks/use-profile";

type Props = { route: Route };

export default async function Profile ({ route }: Props) {

    const data = await profile(route);

    if ( !data ) return null;

    return (

        <HostProfile
            name={data.name} initials={data.initials} image={data.image} verified={data.verified}
            city={data.city} since={data.since} stats={data.stats} facts={data.facts}
        />

    );

}
