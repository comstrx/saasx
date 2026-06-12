import { type NextRequest, NextResponse } from "next/server";

export type Guard = ( request: NextRequest ) => NextResponse | undefined;

export function chain ( guards: Guard[] ) {

    return ( request: NextRequest ): NextResponse => {

        for ( const guard of guards ) {

            const response = guard(request);

            if ( response ) return response;

        }

        return NextResponse.next();

    };

}
