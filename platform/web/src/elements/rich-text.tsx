import type { ReactNode } from "react";
import { type MarkupNode, parseMarkup } from "@/lib/std/text";

function render ( node: MarkupNode ): ReactNode {

    if ( typeof node === "string" ) return node;

    const Tag = node.tag;
    const children = node.children.map(render);

    if ( Tag === "br" ) return <br key={node.key} />;
    if ( Tag === "a" && !node.href ) return children;

    return <Tag key={node.key} {...(Tag === "a" ? { href: node.href } : {})}>{children}</Tag>;

}
export default function RichText ({ value }: { value: string }) {

    return (

        <div className="prose-content" dir="auto">

            {parseMarkup(value).map(render)}

        </div>

    );

}
