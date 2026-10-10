import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { story } from "@/brand/story";
import { StoryDeck } from "@/components/story-deck";
import { useSceneActive } from "@/features/shell/hooks/use-scene-active";
import { usePrefs } from "@/store/prefs";

export function StoryScreen () {

    const { t } = useTranslation();
    const active = useSceneActive();
    const welcome = usePrefs(( state ) => state.welcome );
    const finish = () => { welcome(); router.replace("/"); };

    return (
        <StoryDeck
            active={active}
            pages={story.map(( chapter ) => ({ key: chapter.key, figure: chapter.banner, title: t(`story.${ chapter.key }.title`), body: t(`story.${ chapter.key }.body`) }))}
            labels={{ skip: t("story.skip"), next: t("common.next"), back: t("common.back"), finish: t("story.finish") }}
            onFinish={finish}
        />
    );

}
