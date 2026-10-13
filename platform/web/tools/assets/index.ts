import { type AssetFolder, composeAssets as compose, type Files, assetFiles as files, type Skip } from "@engine/tooling";

const folders: readonly AssetFolder[] = [
    { path: "assets/images/brand", brand: "images" },
    { path: "assets/videos/brand", brand: "videos" },
    { path: "assets/audios/brand", brand: "audios" },
    { path: "assets/fonts", brand: "fonts" },
    { path: "assets/licenses", brand: "licenses" },
    { path: ".well-known", brand: "well-known" },
];
const skip: Skip = ( name, base, publicFiles ) => (base.startsWith(".") && !(publicFiles && name === ".well-known")) || base === "_generated";

export type { Files };
export const specPaths = folders.map(( folder ) => folder.path);
export const brandFolders = [...folders.map(( folder ) => folder.brand), "messages"];

export function assetFiles ( folder: string, publicFiles = false ): Files {

    return files(folder, skip, publicFiles);

}
export function composeAssets ( publicFolder: string, brand: string ): Files {

    return compose(folders, publicFolder, brand, skip);

}
