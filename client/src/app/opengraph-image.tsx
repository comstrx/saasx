import { ImageResponse } from "next/og";
import { env } from "@/lib/env/client";

export const alt = env.NEXT_PUBLIC_APP_NAME;

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default function OpenGraphImage () {

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background: "#020617",
                    padding: "80px",
                    color: "white",
                }}
            >

                <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em" }}>
                    {env.NEXT_PUBLIC_APP_NAME}
                </div>

                <div style={{ marginTop: 24, fontSize: 34, color: "#94a3b8" }}>
                    {env.NEXT_PUBLIC_APP_DESCRIPTION}
                </div>

                <div style={{ marginTop: 64, fontSize: 26, color: "#38bdf8" }}>
                    {env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}
                </div>

            </div>
        ),
        size,
    );

}
