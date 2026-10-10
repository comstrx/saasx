import CategoryGrid from "@/components/category-grid";
import PageFlow from "@/components/page-flow";
import { directory } from "../hooks/use-directory";

export default async function Directory () {

    const groups = await directory();

    if ( !groups?.length ) return null;

    return (

        <PageFlow gap={12}>

            {groups.map(( group ) => <CategoryGrid key={group.key} title={group.title} items={group.items} />)}

        </PageFlow>

    );

}
