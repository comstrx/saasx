import SiteFooter from "@/components/site-footer";
import { type FooterOptions, footer } from "../hooks/use-footer-content";

export default async function Footer ( options: FooterOptions ) {

    return <SiteFooter {...await footer(options)} />;

}
