"use client";

import CollectionControls from "@/components/collection-controls";
import CollectionView from "@/components/collection-view";
import FavoriteManager from "@/components/favorite-manager";
import FormRetry from "@/components/form-retry";
import NavigationLinks from "@/components/navigation-links";
import Pager from "@/components/pager";
import ResultsToolbar from "@/components/results-toolbar";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useFavorites } from "../hooks/use-favorites";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    options: { login: string; browse: string; limit: number; art: string };
};

export default function Favorites ({ title, description, icon, tone, options }: Props) {

    const data = useFavorites(options);
    const { t, common, request } = data;

    if ( data.ready && (!data.token || data.expired) ) return <SignInPrompt
        level={1} title={title} description={t("signInBody")} href={data.login} label={t("signIn")} art={options.art}
    />;

    return (

        <CollectionView title={title} description={description} icon={icon} tone={tone}
            controls={data.denied || data.empty && data.page === 1 && data.kind === "all"
                ? undefined : <CollectionControls {...data.controls} />}>

            {data.denied ? <StateNotice title={t("deniedTitle")} description={t("deniedBody")} /> : <>

                {data.items.length ? <ResultsToolbar title={data.count} /> : null}
                {!data.ready || request.loading && !request.data ? <SectionSkeleton /> : null}
                {request.error ? <FormRetry
                    id="favorites-failure" message={common("failedBody")} label={common("retry")} onRetry={request.reload}
                /> : null}
                <FavoriteManager key={data.token ?? "guest"} items={data.items} loading={request.loading || !!request.error} />
                {data.empty ? <StateNotice
                    art={options.art}
                    title={t(data.page > 1 ? "pageEmptyTitle" : data.kind !== "all" ? "filteredTitle" : "emptyTitle")}
                    description={t(data.page > 1 ? "pageEmptyBody" : data.kind !== "all" ? "filteredBody" : "emptyBody")}
                    action={<NavigationLinks items={[{
                        href: data.page > 1 ? data.first : data.kind !== "all" ? data.clear : data.browse,
                        label: t(data.page > 1 ? "firstPage" : data.kind !== "all" ? "showAll" : "explore"),
                    }]} />}
                /> : null}
                {data.pager.previous || data.pager.next ? <Pager {...data.pager} /> : null}

            </>}

        </CollectionView>

    );

}
