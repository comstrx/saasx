import { act, render } from "@testing-library/react-native";
import { Adopt } from "@/features/boot/adopt";
import { usePrefs } from "@/store/prefs";

const mockSave = jest.fn();
let mockViewer = 124;
let mockProfile = { data: { id: 124, preferences: { language: "en", currency: "SAR", theme: "light" } }, dataUpdatedAt: 1 };

jest.mock("@/query/account", () => ({
    useAccount: () => mockProfile,
    useSavePreferences: () => ({ mutate: mockSave }),
}));
jest.mock("@/query/wire", () => ({ useViewer: () => mockViewer }));
jest.mock("@/std/key", () => ({ key: { attempt: () => "local-attempt" } }));
jest.mock("@/store/storage", () => ({ storage: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn() } }));
jest.mock("@/std/appearance", () => ({ applyAppearance: jest.fn().mockResolvedValue(undefined) }));
jest.mock("expo-localization", () => ({ getLocales: () => [ { languageCode: "en", currencyCode: "EGP" } ] }));

beforeEach(() => {

    mockSave.mockClear();
    mockViewer = 124;
    mockProfile = { data: { id: 124, preferences: { language: "en", currency: "SAR", theme: "light" } }, dataUpdatedAt: 1 };
    usePrefs.setState({ language: "ar", languageChosen: true, currency: "EGP", currencyChosen: true, theme: "dark", inheritFor: null, seeded: false, storyPending: false });

});

test("a new account keeps device preferences until they are saved", async () => {

    usePrefs.getState().inherit(124);
    const view = await render(<Adopt />);
    expect(mockSave).toHaveBeenCalledWith({
        patch: { language: "ar", currency: "EGP", theme: "dark" }, viewer: 124, attempt: "local-attempt",
    });
    expect(usePrefs.getState().theme).toBe("dark");
    expect(usePrefs.getState().inheritFor).toBe(124);

    mockProfile = { data: { id: 124, preferences: { language: "ar", currency: "EGP", theme: "dark" } }, dataUpdatedAt: 2 };
    await view.rerender(<Adopt />);
    expect(usePrefs.getState().inheritFor).toBeNull();

});

test("an existing account restores all saved choices even after explicit guest changes", async () => {

    await render(<Adopt />);
    expect(usePrefs.getState()).toEqual(expect.objectContaining({ language: "en", currency: "SAR", theme: "light" }));
    expect(mockSave).not.toHaveBeenCalled();

});

test("a previous account response cannot replace the current preferences", async () => {

    mockViewer = 125;
    await render(<Adopt />);
    expect(usePrefs.getState()).toEqual(expect.objectContaining({ language: "ar", currency: "EGP", theme: "dark" }));
    expect(mockSave).not.toHaveBeenCalled();

});

test("device discovery seeds supported locale and currency without replacing manual choices", () => {

    usePrefs.setState({ languageChosen: false, currencyChosen: false, currency: "USD" });
    usePrefs.getState().seed({ languages: [ "ar", "en" ], currencies: [ "USD", "EGP" ] });
    expect(usePrefs.getState()).toEqual(expect.objectContaining({ language: "en", currency: "EGP" }));

    usePrefs.setState({ seeded: false });
    usePrefs.getState().setLanguage("ar");
    usePrefs.getState().setCurrency("USD");
    usePrefs.getState().seed({ languages: [ "ar", "en" ], currencies: [ "USD", "EGP" ] });
    expect(usePrefs.getState()).toEqual(expect.objectContaining({ language: "ar", currency: "USD" }));

});

test("finishing stories clears the persisted continuation", async () => {

    await act(() => usePrefs.getState().startStory());
    expect(usePrefs.getState().storyPending).toBe(true);
    await act(() => usePrefs.getState().welcome());
    expect(usePrefs.getState().storyPending).toBe(false);
    expect(usePrefs.getState().welcomed).toBe(true);

});
