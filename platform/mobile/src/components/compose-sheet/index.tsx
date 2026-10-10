import { useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Sheet } from "@/elements/sheet";
import { Stars } from "@/elements/stars";
import { Text } from "@/elements/text";
import { Textarea } from "@/elements/textarea";

type Composed = {
    rating: number;
    title: string;
    content: string;
};

type RatingCopy = {
    label: string;
    prompt: string;
    words: readonly string[];
};

type ComposeSheetProps = {
    open: boolean;
    title: string;
    body?: string | undefined;
    subjectHint: string;
    contentHint: string;
    action: string;
    rating?: RatingCopy | undefined;
    busy?: boolean | undefined;
    error?: string | undefined;
    onSubmit: ( composed: Composed ) => void;
    onClose: () => void;
};

export function ComposeSheet ({
    open,
    title,
    body,
    subjectHint,
    contentHint,
    action,
    rating,
    busy = false,
    error,
    onSubmit,
    onClose,
}: ComposeSheetProps) {

    const [ score, setScore ] = useState(0);
    const [ subject, setSubject ] = useState("");
    const [ content, setContent ] = useState("");

    useEffect(() => {

        if ( open ) return;

        setScore(0);
        setSubject("");
        setContent("");

    }, [ open ]);

    const ready = content.trim().length > 0 && ( !rating || score > 0 );

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={title}
            scroll
            footer={(
                <Button
                    label={action}
                    loading={busy}
                    disabled={!ready}
                    onPress={() => onSubmit({ rating: score, title: subject.trim(), content: content.trim() }) }
                />
            )}
        >
            {body ? (
                <View style={styles.copy}>
                    <Text rank="body" ink="soft">{body}</Text>
                </View>
            ) : null}

            {rating ? (
                <View style={styles.rate}>
                    <Stars value={score} onChange={setScore} label={rating.label} />

                    <Text rank="caption" ink={score > 0 ? undefined : "faint"} tint={score > 0 ? "brand" : undefined} align="center">
                        {score > 0 ? rating.words[score - 1] ?? "" : rating.prompt}
                    </Text>
                </View>
            ) : null}

            <Field
                placeholder={subjectHint}
                value={subject}
                onChangeText={setSubject}
                maxLength={80}
            />

            <Textarea
                placeholder={contentHint}
                value={content}
                onChangeText={setContent}
                limit={800}
                error={error}
            />
        </Sheet>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    copy: {
        paddingHorizontal: theme.space["1"],
    },
    rate: {
        gap: theme.space["2"],
    },

}));
