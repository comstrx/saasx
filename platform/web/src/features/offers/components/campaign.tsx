import CampaignDetail from "@/components/campaign-detail";
import type { Route } from "@/lib/spec/feature";
import { campaign } from "../hooks/use-board";

type Props = { route: Route };

export default async function Campaign ({ route }: Props) {

    const data = await campaign(route);

    if ( !data ) return null;

    return <CampaignDetail {...data} />;

}
