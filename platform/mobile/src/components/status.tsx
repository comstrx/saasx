import { isFailure } from "@engine/error";
import Spinner from "@/elements/spinner";
import Text from "@/elements/text";

type Props = { status: "loading" | "failed" | "idle"; loading: string; failed: string; offline?: string | undefined; error?: unknown };

function offline ( error: unknown ): boolean {

    return isFailure(error) && (error.kind === "network" || error.kind === "timeout");

}
export default function Status ({ status, loading, failed, offline: away, error }: Props) {

    if ( status === "loading" ) return <Spinner label={loading} />;
    if ( status === "failed" ) return <Text text={away && offline(error) ? away : failed} tone="danger" />;

    return null;

}
