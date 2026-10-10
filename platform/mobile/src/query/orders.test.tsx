import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { orders, type QuoteRow } from "@/api/endpoints/orders";
import type { CheckoutBasket } from "@/model/checkout";
import { usePreview } from "@/query/orders";
import { useCurrency } from "@/query/wire";

jest.mock("@/query/wire", () => ({ useCurrency: jest.fn(() => "EGP") }));

const basket: CheckoutBasket = { catalog: 10, quantity: 1, startsAt: "2026-10-02", endsAt: "2026-10-03", adults: 1, children: 0, infants: 0, pets: 0, pay: "wallet" };
const quote = ( token: string, total: string ): QuoteRow => ({ currency: "USD", total_price: total, min_first_payment: "0", family_total: total, deposit_percent: "0", quote_token: token });

const pendingQuote = () => {

    let settle: (( value: QuoteRow ) => void) | undefined;
    const promise = new Promise<QuoteRow>(( resolve ) => { settle = resolve; });

    return { promise, resolve: ( value: QuoteRow ) => settle?.(value) };

};

const setup = () => {

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    return { client, wrapper };

};

afterEach(() => {

    jest.restoreAllMocks();
    jest.mocked(useCurrency).mockReturnValue("EGP");

});

test("changing payment retains the layout's old quote only while a new quote is pending", async () => {

    const next = pendingQuote();
    jest.spyOn(orders, "preview").mockResolvedValueOnce(quote("wallet-quote", "100")).mockReturnValueOnce(next.promise);
    const { client, wrapper } = setup();
    const hook = await renderHook(( value: CheckoutBasket ) => usePreview(value), { initialProps: basket, wrapper });

    await waitFor(() => expect(hook.result.current.data?.token).toBe("wallet-quote"));
    await hook.rerender({ ...basket, pay: "directly", gateway: 2 });

    expect(hook.result.current.data?.token).toBe("wallet-quote");
    expect(hook.result.current.isPlaceholderData).toBe(true);
    expect(hook.result.current.isFetching).toBe(true);

    await act(() => next.resolve(quote("gateway-quote", "103")));
    await waitFor(() => expect(hook.result.current.data?.token).toBe("gateway-quote"));
    expect(hook.result.current.isPlaceholderData).toBe(false);
    expect(hook.result.current.data?.total).toBe(103);

    await hook.unmount();
    client.clear();

});

test.each([ "catalog", "currency" ])("a different %s cannot borrow the preceding quote", async ( change ) => {

    const next = pendingQuote();
    jest.spyOn(orders, "preview").mockResolvedValueOnce(quote("first-quote", "100")).mockReturnValueOnce(next.promise);
    const { client, wrapper } = setup();
    const hook = await renderHook(( value: CheckoutBasket ) => usePreview(value), { initialProps: basket, wrapper });

    await waitFor(() => expect(hook.result.current.data?.token).toBe("first-quote"));
    if ( change === "currency" ) jest.mocked(useCurrency).mockReturnValue("EUR");
    await hook.rerender(change === "catalog" ? { ...basket, catalog: 20 } : { ...basket });

    expect(hook.result.current.data).toBeUndefined();
    expect(hook.result.current.isPlaceholderData).toBe(false);

    await act(() => next.resolve(quote("next-quote", "200")));
    await waitFor(() => expect(hook.result.current.data?.token).toBe("next-quote"));
    await hook.unmount();
    client.clear();

});
