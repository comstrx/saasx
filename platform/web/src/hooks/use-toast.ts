"use client";

import { Toast } from "@/lib/providers/ui";

type Tone = "success" | "error" | "warning" | "info";
type Notice = { title: string; description?: string; tone?: Tone; action?: { label: string; onClick: () => void }; timeout?: number };

export function useToast () {

    const manager = Toast.useToastManager();

    return ( notice: Notice ) => manager.add({
        title: notice.title,
        description: notice.description,
        type: notice.tone ?? "info",
        timeout: notice.action || notice.tone === "error" ? 0 : notice.timeout ?? 4500,
        actionProps: notice.action ? { children: notice.action.label, onClick: notice.action.onClick } : undefined,
    });

}
