import ContactChannels from "@/components/contact-channels";
import PageFlow from "@/components/page-flow";
import PageHeader from "@/components/page-header";
import { contactPage } from "../hooks/use-documents";

type Props = { title: string; description: string; art: string; heading: boolean };

export default async function Contact ({ title, description, art, heading }: Props) {

    const contact = await contactPage();

    return (

        <PageFlow gap={8}>

            <PageHeader title={title} description={description} art={`/assets/images/brand/${art}.webp`} heading={heading} />

            <ContactChannels {...contact} />

        </PageFlow>

    );

}
