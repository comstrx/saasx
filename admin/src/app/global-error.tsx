"use client";

import { useEffect } from "react";

export default function GlobalError ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {

    useEffect(() => {

        console.error(error);

    }, [error]);

    return (

        <html lang="en">

            <body
                style={{
                    minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 16, fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#fafafa"
                }}
            >

                <p>Something went wrong.</p>

                { error.digest ? <code style={{ fontSize: 12, opacity: 0.5 }}>{error.digest}</code> : null }

                <button
                    type="button"
                    onClick={reset}
                    style={{
                        padding: "8px 20px", borderRadius: 8, border: "1px solid #333",
                        background: "transparent", color: "inherit", cursor: "pointer"
                    }}
                >
                    Retry
                </button>

            </body>

        </html>

    );

}
