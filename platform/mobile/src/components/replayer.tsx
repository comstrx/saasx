import { useReplay } from "@/hooks/use-client";
import { useDevice } from "@/hooks/use-device";

export default function Replayer () {

    useReplay(useDevice());

    return null;

}
