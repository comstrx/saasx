"use client";

import CollectionView from "@/components/collection-view";
import FormRetry from "@/components/form-retry";
import ListControls from "@/components/list-controls";
import NavigationLinks from "@/components/navigation-links";
import OrderStats from "@/components/order-stats";
import Pager from "@/components/pager";
import RecordList from "@/components/record-list";
import ResultsToolbar from "@/components/results-toolbar";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { useOrderList } from "../hooks/use-order-list";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { login: string; order: string; browse: string; limit: number; art: string; empty: string };
};

export default function OrderList ({ title, description, icon, tone, links }: Props) {

    const result = useOrderList(links);
    const { t, common, request } = result;

    if ( result.ready && (!result.token || result.expired) ) return (

        <SignInPrompt level={1} title={title} description={t("signInBody")} label={t("signIn")} art={links.art} href={result.login} />

    );

    return (

        <CollectionView
            title={title}
            description={description}
            icon={icon}
            tone={tone}
            stats={<OrderStats {...result.stats} />}
            controls={<ListControls {...result.controls} />}
            busy={{ active: request.loading && result.items.length > 0, label: common("loading") }}
        >

            {!result.ready || (request.loading && !result.items.length) ? <SectionSkeleton /> : result.denied ? (

                <StateNotice title={t("deniedTitle")} description={t("deniedBody")} />

            ) : request.error ? (

                <FormRetry id="orders-failure" message={common("failedBody")} label={common("retry")} onRetry={request.reload} />

            ) : result.items.length ? (

                <>

                    <ResultsToolbar title={result.count} />
                    <RecordList items={result.items} label={t("list")} bulk={result.bulk} />
                    {result.pager.previous || result.pager.next ? <Pager {...result.pager} /> : null}

                </>

            ) : (

                <>

                    <StateNotice
                        art={links.empty}
                        title={t(result.laterPage ? "pageEmptyTitle" : result.filtered ? "noMatchTitle" : "emptyTitle")}
                        description={t(result.laterPage ? "pageEmptyBody" : result.filtered ? "noMatchBody" : "emptyBody")}
                        action={<NavigationLinks items={[{
                            href: result.laterPage || result.filtered ? result.clear : result.browse,
                            label: t(result.laterPage ? "back" : result.filtered ? "clear" : "explore"),
                        }]} />}
                    />
                    {result.pager.previous ? <Pager {...result.pager} /> : null}

                </>

            )}

        </CollectionView>

    );

}
