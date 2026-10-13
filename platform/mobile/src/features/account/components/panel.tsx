import { interpolate } from "@engine/parse";
import { field, row } from "@engine/spec";
import AccountCard from "@/components/account-card";
import Status from "@/components/status";
import { usePort } from "@/hooks/use-port";
import { useSession } from "@/hooks/use-session";
import { useWrite } from "@/hooks/use-write";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { hello: string; logout: string; loading: string; failed: string };

export default function Panel ({ options, ports, route }: FeatureProps<Options>) {

    const { end } = useSession();
    const me = usePort(ports.me, route);
    const leave = useWrite(ports.leave);
    const logout = async (): Promise<void> => {

        await leave.run({});
        end();

    };

    if ( me.status !== "ready" ) return <Status status={me.status} loading={options.loading} failed={options.failed} />;

    const user = row(me.value);

    return (

        <AccountCard
            greeting={interpolate(options.hello, { name: field(user, "name") ?? "" })}
            detail={field(user, "role")}
            logout={options.logout}
            busy={leave.status === "pending"}
            onLogout={logout}
        />

    );

}
