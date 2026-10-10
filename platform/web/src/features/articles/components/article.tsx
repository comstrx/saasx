import ArticleView from "@/components/article-view";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Route } from "@/lib/spec/feature";
import { localePath } from "@/lib/std/locale";
import { article } from "../hooks/use-article";

type Props = { route: Route; login: string };

export default async function Article ({ route, login }: Props) {

    const [data, t, locale] = await Promise.all([article(route), getTranslations("articles"), getLocale()]);

    if ( !data ) return null;

    const entrance = localePath(locale, login, routing);

    return (

        <ArticleView
            id={data.id} title={data.title} description={data.description} image={data.image} content={data.content}
            trail={data.trail} facts={data.facts} pictures={data.pictures} direction={data.direction} related={data.related}
            login={entrance}
            labels={{ related: data.labels.related, discussion: data.labels.discussion, gallery: data.labels.gallery }}
            actions={{
                likes: data.likes, dislikes: data.dislikes, favorite: data.favorite, login: entrance,
                labels: {
                    helpful: t("helpful"), like: t("like"), dislike: t("dislike"), favorite: t("favorite"),
                    unfavorite: t("unfavorite"), failed: t("failed"), share: data.labels.share,
                },
            }}
        />

    );

}
