import { Share } from "react-native";

type ShareInput = {
    title: string;
    message: string;
    url?: string | undefined;
};

export function useShare () {

    return ({ title, message, url }: ShareInput) => Share.share({
        title,
        message: [ message, url ].filter(Boolean).join("\n"),
        url,
    });

}
