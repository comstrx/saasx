import files from "@spec/well-known";

type Context = { params: Promise<{ path: string[] }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams (): { path: string[] }[] {

    return Object.keys(files).map(( name ) => ({ path: name.split("/") }));

}
export async function GET ( _request: Request, { params }: Context ): Promise<Response> {

    const file = files[(await params).path.join("/")];

    if ( !file ) return new Response(null, { status: 404 });

    return new Response(Uint8Array.from(atob(file.body), ( char ) => char.charCodeAt(0)), { headers: { "content-type": file.type } });

}
