import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { tooLarge } from "@/elements/hooks/use-image-pick";
import type { ChatUpload, MessagePreview } from "@/model/chat";

const audioName = () => `voice-${ Date.now() }.m4a`;

export function useChatComposer ( maxBytes = 0 ) {

    const [ draft, setDraft ] = useState("");
    const [ files, setFiles ] = useState<readonly ChatUpload[]>([]);
    const [ reply, setReply ] = useState<MessagePreview | null>(null);

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder, 160);

    const append = ( added: readonly ChatUpload[] ) => {

        if ( maxBytes > 0 && added.some(( file ) => ( file.size ?? 0 ) > maxBytes ) ) throw new Error(tooLarge);

        setFiles(( current ) => [ ...current, ...added ].slice(0, 6) );

    };

    const pickMedia = async () => {

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [ "images", "videos" ],
            allowsMultipleSelection: true,
            selectionLimit: 6,
            quality: 0.88,
        });

        if ( result.canceled ) return;

        append(result.assets.map(( asset ) => ({
            uri: asset.uri,
            name: asset.fileName ?? `media-${ Date.now() }.${ asset.type === "video" ? "mp4" : "jpg" }`,
            mime: asset.mimeType ?? ( asset.type === "video" ? "video/mp4" : "image/jpeg" ),
            size: asset.fileSize,
        })) );

    };

    const takePhoto = async () => {

        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if ( !permission.granted ) throw new Error("camera-permission");

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: [ "images" ],
            quality: 0.88,
        });

        if ( result.canceled ) return;

        append(result.assets.map(( asset ) => ({
            uri: asset.uri,
            name: asset.fileName ?? `photo-${ Date.now() }.jpg`,
            mime: asset.mimeType ?? "image/jpeg",
            size: asset.fileSize,
        })) );

    };

    const pickDocument = async () => {

        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: true,
            copyToCacheDirectory: true,
        });

        if ( result.canceled ) return;

        append(result.assets.map(( asset ) => ({
            uri: asset.uri,
            name: asset.name,
            mime: asset.mimeType ?? "application/octet-stream",
            size: asset.size,
        })) );

    };

    const startRecording = async () => {

        const permission = await requestRecordingPermissionsAsync();

        if ( !permission.granted ) throw new Error("microphone-permission");

        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();

    };

    const stopRecording = async ( keep: boolean ): Promise<ChatUpload | null> => {

        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });

        if ( !keep || !recorder.uri ) return null;

        return {
            uri: recorder.uri,
            name: audioName(),
            mime: "audio/mp4",
        };

    };

    const finishRecording = () => stopRecording(true);

    const cancelRecording = async () => {

        await stopRecording(false);

    };

    const clear = () => {

        setDraft("");
        setFiles([]);
        setReply(null);

    };

    const removeFile = ( uri: string ) => setFiles(( current ) => current.filter(( file ) => file.uri !== uri) );

    return {
        draft,
        files,
        reply,
        recording: recorderState.isRecording,
        recordingMillis: recorderState.durationMillis,
        setDraft,
        setReply,
        removeFile,
        pickMedia,
        takePhoto,
        pickDocument,
        startRecording,
        finishRecording,
        cancelRecording,
        clear,
    };

}
