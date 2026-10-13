import { type AssetFolder, composeAssets as compose, type Files, assetFiles as files, type Skip } from "@engine/tooling";

const folders: readonly AssetFolder[] = [
    { path: "images/brand", brand: "images" },
    { path: "videos/brand", brand: "videos" },
    { path: "audios/brand", brand: "audios" },
    { path: "fonts", brand: "fonts" },
    { path: "licenses", brand: "licenses" },
];
const skip: Skip = ( _name, base, publicFiles ) => base.startsWith(".") || (publicFiles && base === "_generated");

export type { Files };
export const specPaths = folders.map(( folder ) => folder.path);
export const brandFolders = [...folders.map(( folder ) => folder.brand), "messages"];

export function assetFiles ( folder: string, publicFiles = false ): Files {

    return files(folder, skip, publicFiles);

}
export function composeAssets ( assetsFolder: string, brand: string ): Files {

    return compose(folders, assetsFolder, brand, skip);

}
