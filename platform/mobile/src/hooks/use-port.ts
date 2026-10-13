import type { ApiSurface } from "@engine/api";
import { type Resource, usePortResource } from "@engine/context";
import type { CompiledPort, Pagination, Route } from "@engine/spec";
import { useApi } from "@/hooks/use-api";
import { useLocale } from "@/hooks/use-locale";
import { useSession } from "@/hooks/use-session";
import { useSignals } from "@/hooks/use-signal";
import { store } from "@/lib/providers/storage";
import { identity } from "@/lib/spec/config";
import { config } from "@/lib/spec/runtime";
import { live } from "@/stores/realtime";

const cache = { store, ttl: 24 * 60 * 60 * 1000, prefix: `${identity}.port` };

export function usePort ( port: CompiledPort | undefined, route: Route ): Resource<unknown, Pagination> {
    const locale = useLocale();
    const { token } = useSession();
    const signals = useSignals();

    return usePortResource(useApi() as ApiSurface, port, { ...route, signals }, () => config.content, [locale, token], { cache, live });
}
