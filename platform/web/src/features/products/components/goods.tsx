import type { ReactNode } from "react";
import BookingCard from "@/components/booking-card";
import DetailActions from "@/components/detail-actions";
import DetailGroups from "@/components/detail-groups";
import FaqList from "@/components/faq-list";
import PageFlow from "@/components/page-flow";
import PageSplit from "@/components/page-split";
import PhotoViewer from "@/components/photo-viewer";
import ProductSummary from "@/components/product-summary";
import RulesPanel from "@/components/rules-panel";
import type { DetailData } from "../hooks/use-detail";

type Props = { data: DetailData; reviews: ReactNode; similar: ReactNode; note: string };

export default function Goods ({ data, reviews, similar, note }: Props) {

    return (

        <PageFlow gap={12}>

            <PageSplit
                id="overview"
                ratio="3:1"
                sticky
                label={data.bookingLabel}
                end={(

                    <BookingCard
                        key={data.booking.initial}
                        {...data.booking}
                        purpose="buy"
                        note={note}
                        supply={data.goods ? { stock: data.goods.stock, delivery: data.goods.delivery, seller: data.goods.seller } : null}
                    />

                )}
                start={

                    <PageSplit
                        ratio="1:1"
                        start={<PhotoViewer {...data.gallery} />}
                        end={

                            <ProductSummary
                                title={data.header.title}
                                trail={data.header.trail}
                                seller={data.goods?.seller ?? null}
                                sellerHref={data.host?.href}
                                rating={data.header.rating}
                                reviews={data.header.reviews}
                                price={data.booking.price}
                                discount={data.goods?.discount ?? null}
                                currencyLabel={data.nav.price?.currencyLabel ?? data.booking.currency}
                                note={note}
                                stock={data.goods?.stock ?? null}
                                delivery={data.goods?.delivery ?? null}
                                specs={data.goods?.specs ?? []}
                                about={{ title: data.overview.title, text: data.overview.text ?? null }}
                                actions={<DetailActions favorite={data.favorite} share={data.share} />}
                            />

                        }
                    />

                }
            />

            <DetailGroups id="details" groups={data.groups} />

            <RulesPanel id="rules" title={data.rules.title} items={data.rules.items} />

            {reviews}

            <FaqList id="faqs" {...data.faqs} />

            {similar}

        </PageFlow>

    );

}
