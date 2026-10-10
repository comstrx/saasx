import DocumentView from "@/components/document-view";
import EmptyResults from "@/components/empty-results";
import LegalDocument from "@/components/legal-document";
import PageFlow from "@/components/page-flow";
import PageHeader from "@/components/page-header";
import { documentPage } from "../hooks/use-documents";

type Props = { page: string; title: string; description: string; art: string; heading: boolean };

export default async function Page ({ page, title, description, art, heading }: Props) {

    const result = await documentPage(page);

    return (

        <PageFlow gap={8}>

            <PageHeader title={title} description={description} art={`/assets/images/brand/${art}.webp`} heading={heading} />

            {result.failed ? <EmptyResults {...result.empty} /> : result.clauses.length ? (

                <LegalDocument clauses={result.clauses} updated={result.updated} labels={result.labels} />

            ) : <DocumentView content={result.content} updated={result.updated} />}

        </PageFlow>

    );

}
