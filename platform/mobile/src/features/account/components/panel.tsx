import { interpolate } from "@engine/parse";
import { field, row } from "@engine/spec";
import AccountCard from "@/components/account-card";
import Status from "@/components/status";
import { usePort, useSession, useWrite } from "@/hooks/use-client";
import type { FeatureProps } from "@/lib/spec/feature";

export type Options = { hello: string; logout: string; loading: string; failed: string; offline: string; cached: string; errors: Record<string, unknown> };

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
