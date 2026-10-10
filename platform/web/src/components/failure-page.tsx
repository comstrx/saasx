"use client";

import Button from "@/elements/button";
import Container from "@/elements/container";
import Link from "@/elements/link";
import { useFailurePage } from "@/hooks/use-failure-page";
import Icon from "@/icons/icon";
import StateNotice from "./state-notice";

type Props = { art: string; offlineArt: string; home: string; digest?: string; onRetry: () => void };

export default function FailurePage ({ art, offlineArt, home, digest, onRetry }: Props) {

    const { t, offline } = useFailurePage(onRetry);

    return (

        <Container width="boxed">

            {offline ? (

                <StateNotice
                    level={1}
                    art={offlineArt}
                    title={t("offlineTitle")}
                    description={t("offlineBody")}
                    action={<Button variant="outlined" onClick={onRetry}><Icon name="refresh" />{t("offlineRetry")}</Button>}
                />

            ) : (

                <StateNotice
                    level={1}
                    art={art}
                    kind="error"
                    title={t("failureTitle")}
                    description={t("failureBody")}
                    reference={digest ? { label: t("reference"), code: digest } : null}
                    action={

                        <>

                            <Button onClick={onRetry}><Icon name="refresh" />{t("retry")}</Button>

                            <Link href={home} variant="outlined" size="medium"><Icon name="house" />{t("home")}</Link>

                        </>

                    }
                />

            )}

        </Container>

    );

}
