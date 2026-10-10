import AccountMenu from "@/components/account-menu";
import { accountMenu, type MenuOptions } from "../hooks/use-menu";

export default async function Menu ( options: MenuOptions ) {

    return <AccountMenu {...await accountMenu(options)} />;

}
