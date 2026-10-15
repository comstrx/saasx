import { readJson } from "engine/net";
import { cookies } from "next/headers";
import { guardRequest } from "@/lib/site/guard";
import { acceptPreferences, cookieOptions, preferenceCookies, readPreferences } from "@/lib/site/preferences";
import { preferences } from "@/lib/spec/config";

export const dynamic = "force-dynamic";

const fresh = { "cache-control": "no-store" };

export async function GET (): Promise<Response> {

    const store = await cookies();
    const saved = readPreferences(( name ) => store.get(name)?.value);

    return Response.json({ status: true, data: { ...preferences.defaults, ...saved } }, { headers: fresh });

}
export async function POST ( request: Request ): Promise<Response> {

    const refused = guardRequest(request);

    if ( refused ) return refused;

    const accepted = acceptPreferences(await readJson(request, 4 * 1024).catch(() => null));
    const changes = preferenceCookies(accepted);

    if ( !changes.length ) return Response.json({ status: false, message: "No valid preference given." }, { status: 400 });

    const store = await cookies();

    for ( const [name, value] of changes ) store.set(name, value, cookieOptions);

    return Response.json({ status: true, data: accepted }, { headers: fresh });

}
