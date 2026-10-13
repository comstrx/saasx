import { type AssetFolder, composeAssets as compose, type Files, assetFiles as files, type Skip } from "@engine/tooling";

const folders: readonly AssetFolder[] = [
    { path: "images/brand", brand: "images" },
    { path: "fonts", brand: "fonts" },
    { path: "videos", brand: "videos" },
    { path: "audios", brand: "audios" },
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
