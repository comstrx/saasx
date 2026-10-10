import { readdirSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const webp = dir => readdirSync( dir ).filter( f => f.endsWith( ".webp" ) );

const entries = ( dir, prefix ) => webp( dir )
    .map( f => `    "${ basename( f, ".webp" ) }": require( "${ prefix }/${ f }" ),` )
    .join( "\n" );

const source = `import type { ImageRequireSource } from "react-native";

export const flags: Readonly<Record<string, ImageRequireSource>> = {
${ entries( "assets/image/flag", "../../../assets/image/flag" ) }
};
`;

writeFileSync( "src/elements/flag/flags.ts", source );

console.warn( `flags.ts: ${ webp( "assets/image/flag" ).length } flags` );
