"use client";

import type { ComponentProps, ReactNode } from "react";
import RouteProgress from "@/elements/route-progress";
import Toaster from "@/elements/toaster";
import { useNetworkNotice } from "@/hooks/use-network-notice";
import { usePreferenceSync } from "@/hooks/use-preferences";
import { IntlProvider, useTranslations } from "@/lib/providers/intl";
import { MotionConfig } from "@/lib/providers/motion";
import { ThemeProvider } from "@/lib/providers/theme";
import { CSPProvider, DirectionProvider, Toast } from "@/lib/providers/ui";
import { SiteProvider } from "@/lib/site/context";
import { appearance } from "@/lib/spec/config";
import { StoreProvider } from "@/stores/provider";

type Intl = Pick<ComponentProps<typeof IntlProvider>, "locale" | "messages" | "timeZone">;
type Site = Omit<ComponentProps<typeof SiteProvider>, "children">;
type Props = Intl & Site & { children: ReactNode; nonce: string; currency: string; direction: "ltr" | "rtl"; };

function Sync () {

    usePreferenceSync();

    return null;

}
function Chrome () {

    const t = useTranslations("nav");

    useNetworkNotice();

    return (

        <>

            <RouteProgress />

            <Toaster close={t("close")} />

        </>

    );

}
export function Providers ({ children, nonce, currency, direction, settings, content, policy, preferences, ...intl }: Props) {

    return (

        <IntlProvider {...intl}>

            <SiteProvider settings={settings} content={content} policy={policy} preferences={preferences}>

                <ThemeProvider
                    nonce={nonce}
                    attribute={appearance.attribute}
                    storageKey={appearance.storageKey}
                    defaultTheme={settings.theme.default}
                    themes={settings.theme.enabled.filter(( theme ) => theme !== "system")}
                    enableSystem={settings.theme.enabled.includes("system")}
                    disableTransitionOnChange
                >

                    <CSPProvider nonce={nonce}>

                        <DirectionProvider direction={direction}>

                            <MotionConfig nonce={nonce} reducedMotion={settings.motion === "reduced" ? "always" : "user"}>

                                <StoreProvider currency={currency}>

                                    <Toast.Provider>

                                        <Sync />

                                        {children}

                                        <Chrome />

                                    </Toast.Provider>

                                </StoreProvider>

                            </MotionConfig>

                        </DirectionProvider>

                    </CSPProvider>

                </ThemeProvider>

            </SiteProvider>

        </IntlProvider>

    );

}
