import PlanBoard from "@/components/plan-board";
import { type Duration, plans } from "../hooks/use-plans";

type Props = { durations: readonly Duration[]; initial: Duration; start: string; limit: number; art: string };

export default async function Board ({ durations, initial, start, limit, art }: Props) {

    const data = await plans(durations, start, limit);

    return <PlanBoard items={data?.items ?? []} saving={data?.saving ?? 0} durations={durations} initial={initial} art={art} />;

}
