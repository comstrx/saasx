import { act, renderHook } from "@testing-library/react-native";
import { ApiError } from "@/api/client";
import { start } from "@/brand/i18n";
import { settle } from "@/features/auth/flow";
import { useLoginFlow } from "@/features/auth/hooks/use-login";
import { useRegisterFlow } from "@/features/auth/hooks/use-register";

const mockBlurs = new Set<() => void>();
const mockCheck = jest.fn();
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock("expo-router", () => ({
    useFocusEffect: ( callback: () => (() => void) ) => {

        const React = require("react");
        React.useEffect(() => {

            const cleanup = callback();
            mockBlurs.add(cleanup);
            return () => { cleanup(); mockBlurs.delete(cleanup); };

        }, [ callback ]);

    },
}));
jest.mock("@/features/auth/flow", () => ({ leave: jest.fn(), settle: jest.fn() }));
jest.mock("@/query/auth", () => ({
    useAuthCheck: () => ({ mutateAsync: mockCheck, reset: jest.fn() }),
    useLogin: () => ({ mutateAsync: mockLogin, reset: jest.fn() }),
    useRegister: () => ({ mutateAsync: mockRegister, reset: jest.fn() }),
}));
jest.mock("@/query/contract", () => ({
    usePasswordPolicy: () => ({ min: 8, max: 64, lower: true, upper: true, digit: true, symbol: true }),
}));
jest.mock("@/features/shell/hooks/use-dials", () => ({
    useDials: () => [ { iso: "SA", dial: "+966", label: "Saudi Arabia", terms: [] } ],
}));
jest.mock("@/store/notice", () => ({ notify: jest.fn() }));

const deferred = () => {

    let resolve!: ( value: { exists: boolean } | null ) => void;
    const promise = new Promise<{ exists: boolean } | null>(( done ) => { resolve = done; });
    return { promise, resolve };

};

beforeAll(async () => { await start("en"); });

beforeEach(() => {

    mockBlurs.clear();
    mockCheck.mockReset().mockResolvedValue(null);
    mockLogin.mockReset();
    mockRegister.mockReset();
    jest.mocked(settle).mockReset();

});

test("login refuses malformed identities and an explicit missing account", async () => {

    const hook = await renderHook(useLoginFlow);
    await act(() => hook.result.current.pick("email"));
    await act(() => hook.result.current.change("email")("not-an-email"));
    await act(() => hook.result.current.forward());
    expect(mockCheck).not.toHaveBeenCalled();
    expect(hook.result.current.form.step).toBe(1);
    expect(hook.result.current.fields.email).toBeTruthy();

    mockCheck.mockResolvedValue({ exists: false });
    await act(() => hook.result.current.change("email")("missing@example.test"));
    await act(() => hook.result.current.forward());
    expect(hook.result.current.form.step).toBe(1);
    expect(hook.result.current.fields.email).toBeTruthy();

});

test("double presses issue one check; edits and blur discard its late response", async () => {

    const pending = deferred();
    mockCheck.mockReturnValue(pending.promise);
    const hook = await renderHook(useLoginFlow);
    await act(() => hook.result.current.pick("email"));
    await act(() => hook.result.current.change("email")("first@example.test"));
    let first!: Promise<void>;
    await act(() => { first = hook.result.current.forward(); void hook.result.current.forward(); });
    expect(mockCheck).toHaveBeenCalledTimes(1);
    await act(() => hook.result.current.change("email")("second@example.test"));
    await act(async () => { pending.resolve({ exists: true }); await first; });
    expect(hook.result.current.form.step).toBe(1);

    const next = deferred();
    mockCheck.mockReturnValue(next.promise);
    await act(() => { first = hook.result.current.forward(); });
    await act(() => { for ( const blur of mockBlurs ) blur(); });
    await act(async () => { next.resolve({ exists: true }); await first; });
    expect(hook.result.current.form.email).toBe("");
    expect(hook.result.current.form.password).toBe("");
    expect(hook.result.current.form.step).toBe(0);

});

test("going back clears the password; leaving during login never settles the old session", async () => {

    const hook = await renderHook(useLoginFlow);
    await act(() => hook.result.current.pick("email"));
    await act(() => hook.result.current.change("email")("member@example.test"));
    await act(() => hook.result.current.forward());
    await act(() => hook.result.current.change("password")("Private-Aa1!"));
    await act(() => hook.result.current.back());
    expect(hook.result.current.form.password).toBe("");
    expect(hook.result.current.form.hidden).toBe(true);
    await act(() => hook.result.current.forward());
    await act(() => hook.result.current.change("password")("Private-Aa1!"));

    const pending = deferred();
    mockLogin.mockReturnValue(pending.promise);
    let request!: Promise<void>;
    await act(() => { request = hook.result.current.submit(); });
    await act(() => { for ( const blur of mockBlurs ) blur(); });
    await act(async () => { pending.resolve(null); await request; });
    expect(settle).not.toHaveBeenCalled();

});

test("registration rejects taken email, validates profile and waits for the phone check", async () => {

    const hook = await renderHook(useRegisterFlow);
    await act(() => hook.result.current.go(1));
    await act(() => hook.result.current.change("email")("member@example.test"));
    mockCheck.mockResolvedValueOnce({ exists: true });
    await act(() => hook.result.current.claim());
    expect(hook.result.current.form.step).toBe(1);
    expect(hook.result.current.fields.email).toBeTruthy();

    await act(() => hook.result.current.claim());
    expect(hook.result.current.form.step).toBe(2);
    await act(() => hook.result.current.edit({ name: " ", iso: "SA", digits: "512345678" }));
    await act(() => hook.result.current.about());
    expect(hook.result.current.fields.name).toBeTruthy();
    expect(hook.result.current.form.step).toBe(2);

    await act(() => hook.result.current.change("name")("Flow Tester"));
    mockCheck.mockRejectedValueOnce(new ApiError(422, "validation", "", { phone: [ "invalid" ] }));
    await act(() => hook.result.current.about());
    expect(hook.result.current.form.step).toBe(2);
    expect(hook.result.current.fields.phone).toBeTruthy();

    mockCheck.mockResolvedValueOnce({ exists: true });
    await act(() => hook.result.current.about());
    expect(hook.result.current.form.step).toBe(2);

    await act(() => hook.result.current.about());
    expect(hook.result.current.form.step).toBe(3);
    expect(mockCheck).toHaveBeenLastCalledWith(expect.objectContaining({ identity: { kind: "phone", value: "+966512345678" } }));

});

test.each([ [ "email", 1 ], [ "phone", 2 ], [ "name", 2 ] ] as const)(
    "a final %s refusal returns to step %s with both secrets empty",
    async ( field, step ) => {

        const hook = await renderHook(useRegisterFlow);
        await act(() => hook.result.current.go(1));
        await act(() => hook.result.current.change("email")("new@example.test"));
        await act(() => hook.result.current.claim());
        await act(() => hook.result.current.edit({ name: "Flow Tester", iso: "SA", digits: "512345678" }));
        await act(() => hook.result.current.about());
        await act(() => hook.result.current.edit({ password: "Private-Aa1!", password_confirmation: "Private-Aa1!", hidden: false }));
        mockRegister.mockRejectedValue(new ApiError(409, "conflict", "", { [field]: [ "taken" ] }));
        await act(() => hook.result.current.submit());
        expect(hook.result.current.form.step).toBe(step);
        expect(hook.result.current.form.password).toBe("");
        expect(hook.result.current.form.password_confirmation).toBe("");
        expect(hook.result.current.form.hidden).toBe(true);
        expect(hook.result.current.fields[field]).toBeTruthy();

    },
);

test("registration blocks mismatched passwords and unvalidated step jumping", async () => {

    const hook = await renderHook(useRegisterFlow);
    await act(() => hook.result.current.go(3));
    await act(() => hook.result.current.submit());
    expect(mockRegister).not.toHaveBeenCalled();
    expect(hook.result.current.form.step).toBe(1);

    await act(() => hook.result.current.change("email")("new@example.test"));
    await act(() => hook.result.current.claim());
    await act(() => hook.result.current.edit({ name: "Flow Tester", iso: "SA", digits: "512345678" }));
    await act(() => hook.result.current.about());
    await act(() => hook.result.current.edit({ password: "Private-Aa1!", password_confirmation: "Different-Aa1!" }));
    await act(() => hook.result.current.submit());
    expect(mockRegister).not.toHaveBeenCalled();
    expect(hook.result.current.fields.password_confirmation).toBeTruthy();
    await act(() => hook.result.current.back());
    expect(hook.result.current.form.password).toBe("");
    expect(hook.result.current.form.password_confirmation).toBe("");

});
