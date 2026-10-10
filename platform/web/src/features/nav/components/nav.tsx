import SiteNav from "@/components/site-nav";
import { type NavigationOptions, navigation } from "../hooks/use-navigation";

export default async function Nav ( options: NavigationOptions ) {

    return <SiteNav {...await navigation(options)} />;

}
