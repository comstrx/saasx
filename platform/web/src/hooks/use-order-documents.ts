"use client";

import type { Data } from "@/api/features";
import { useRead } from "@/hooks/use-operation";
import { deliveredFiles, fileItems } from "@/lib/std/files";
import { webUrl } from "@/lib/std/url";

export function useOrderDocuments ( order: Data<"orders", "view"> ) {

    const assets = order.digital_assets ?? [];
    const catalog = useRead("products", "view", { productId: order.catalog?.id ?? 0 }, {
        enabled: !!assets.length && !!order.catalog?.id,
    });

    return {
        catalog, attachments: fileItems(order.attachments ?? []),
        digital: deliveredFiles(assets, catalog.data?.attachments ?? []),
        code: order.qrcode ? order.secret_key : null,
        qr: webUrl(order.qrcode),
    };

}
