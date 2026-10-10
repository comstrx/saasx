import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Band } from "@/components/band";
import { Carousel } from "@/components/carousel";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Screen } from "@/elements/screen";
import { SectionCard } from "@/features/sections/components/section-card";
import { SectionsSkeleton } from "@/features/sections/components/skeleton";
import { Feed } from "@/features/shell";
import { retreat } from "@/features/shell/retreat";
import { type Branch, branchesOf, type Category, reachOf } from "@/model/category";
import { useCategories } from "@/query/categories";
import { clamp } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type Shelf = {
    key: number;
    title: string;
    note: string;
    root: number;
    cards: readonly Category[];
};

export function SectionsScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const listed = useCategories();

    const branches = branchesOf(listed.data ?? []);
    const railed = branches.filter(( branch: Branch ) => branch.children.length > 0 );
    const solo = branches.filter(( branch: Branch ) => branch.children.length === 0 );
    const span = clamp(Math.round(( width - theme.layout.gutter * 2 - theme.space["3"] * 2 ) / 2.2), 124, 180);

    const open = ( id: number ) => router.push(`/category/${ id }`);

    const shelves: readonly Shelf[] = [
        ...railed.map(( branch: Branch ) => ({
            key: branch.root.id,
            title: branch.root.name,
            note: t("sections.holds", { count: reachOf(branch) }),
            root: branch.root.id,
            cards: branch.children,
        })),
        ...( solo.length > 0 ? [ {
            key: 0,
            title: t("sections.others"),
            note: t("sections.othersBody"),
            root: 0,
            cards: solo.map(( branch: Branch ) => branch.root ),
        } ] : [] ),
    ];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("sections.title")} onBack={() => retreat() } />

            <Feed
                list={listed}
                items={shelves}
                keyOf={( shelf ) => String(shelf.key) }
                gap="6"
                loading={<SectionsSkeleton span={span} />}
                empty={<Empty emblem="folder" title={t("sections.emptyTitle")} note={t("sections.emptyBody")} />}
                render={( shelf ) => (
                    <View key={shelf.key} style={styles.shelf}>
                        <View style={styles.heading}>
                            <Band
                                title={shelf.title}
                                note={shelf.note}
                                action={shelf.root > 0 ? t("common.seeAll") : undefined}
                                onAction={shelf.root > 0 ? () => open(shelf.root) : undefined}
                            />
                        </View>

                        <Carousel slide={span} inset={theme.layout.gutter} gap={theme.space["3"]}>
                            {shelf.cards.map(( category ) => (
                                <SectionCard key={category.id} category={category} width={span} onPress={() => open(category.id) } />
                            ))}
                        </Carousel>
                    </View>
                )}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    shelf: {
        gap: theme.space["3"],
        marginHorizontal: -theme.layout.gutter,
    },
    heading: {
        paddingHorizontal: theme.layout.gutter,
    },

}));
