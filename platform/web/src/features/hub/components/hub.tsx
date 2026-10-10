import AccountHub from "@/components/account-hub";
import { type HubOptions, hub } from "../hooks/use-hub";

export default async function Hub ( options: HubOptions ) {

    return <AccountHub {...await hub(options)} />;

}
