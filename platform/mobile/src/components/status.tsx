import { unreachable } from "engine/error";
import Spinner from "@/elements/spinner";
import SceneNote from "./scene";

type Props = { status: "loading" | "failed" | "idle"; loading: string; failed: string; offline?: string | undefined; error?: unknown };

export default function Status ({ status, loading, failed, offline, error }: Props) {

    if ( status === "loading" ) return <Spinner label={loading} />;
    if ( status === "failed" && offline && unreachable(error) ) return <SceneNote scene="offline" text={offline} />;
    if ( status === "failed" ) return <SceneNote scene="failed" text={failed} tone="danger" />;

    return null;

}
