import CouponList from "@/components/coupon-list";
import EntityActions from "@/components/entity-actions";
import EntityHero from "@/components/entity-hero";
import PageFlow from "@/components/page-flow";
import StatGrid from "@/components/stat-grid";
import type { Route } from "@/lib/spec/feature";
import { category } from "../hooks/use-category";

type Props = { route: Route };

export default async function Category ({ route }: Props) {

    const data = await category(route);

    if ( !data ) return null;

    return (

        <PageFlow gap={12}>

            <EntityHero
                title={data.title} trail={data.trail} description={data.about} art={data.art} kind={data.kind} rating={data.rating}
                location={data.location} facts={data.facts}
            >

                <EntityActions feature="categories" id={data.id} name={data.title} saved={data.saved} login="/login" />

            </EntityHero>

            <StatGrid {...data.stats} />

            <CouponList title={data.labels.coupons} description={data.labels.couponsBody} items={data.coupons} />

        </PageFlow>

    );

}
