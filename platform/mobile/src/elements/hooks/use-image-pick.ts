import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import type { UploadFile } from "@/std/file";

export const tooLarge = "file-too-large";

const weighed = ( asset: ImagePicker.ImagePickerAsset, maxBytes: number ): ImagePicker.ImagePickerAsset => {

    if ( maxBytes > 0 && ( asset.fileSize ?? 0 ) > maxBytes ) throw new Error(tooLarge);

    return asset;

};

const named = ( asset: ImagePicker.ImagePickerAsset, fallback: string ): UploadFile => ({
    uri: asset.uri,
    name: asset.fileName ?? fallback,
    type: asset.mimeType ?? "image/jpeg",
});

type ImagePick = {
    fromLibrary: () => Promise<UploadFile | null>;
    fromCamera: () => Promise<UploadFile | null>;
};

const shot: ImagePicker.ImagePickerOptions = {
    mediaTypes: [ "images" ],
    quality: 0.9,
};

export function useImagePick ( maxBytes = 0 ): ImagePick {

    const fromLibrary = useCallback(async (): Promise<UploadFile | null> => {

        const result = await ImagePicker.launchImageLibraryAsync(shot);
        const asset = result.canceled ? null : result.assets[0];

        return asset ? named(weighed(asset, maxBytes), `photo-${ asset.assetId ?? "picked" }.jpg`) : null;

    }, [ maxBytes ]);

    const fromCamera = useCallback(async (): Promise<UploadFile | null> => {

        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if ( !permission.granted ) throw new Error("camera-permission");

        const result = await ImagePicker.launchCameraAsync(shot);
        const asset = result.canceled ? null : result.assets[0];

        return asset ? named(weighed(asset, maxBytes), `photo-${ asset.assetId ?? "shot" }.jpg`) : null;

    }, [ maxBytes ]);

    return { fromLibrary, fromCamera };

}
