import { router } from "expo-router";
import { settle } from "@/features/auth/flow";
import type { AuthOutcome } from "@/model/auth";

const mockOpen = jest.fn().mockResolvedValue(undefined);
const mockStartStory = jest.fn();

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), canDismiss: jest.fn().mockReturnValue(true), dismissAll: jest.fn() } }));
jest.mock("@/store/session", () => ({ useSession: { getState: () => ({ open: mockOpen }) } }));
jest.mock("@/store/prefs", () => ({ usePrefs: { getState: () => ({ startStory: mockStartStory }) } }));
jest.mock("@/model/auth", () => ({ challenged: ( result: object ) => "challenge_token" in result }));

beforeEach(() => jest.clearAllMocks());

const success = { token: "local-test-session", user: { id: 124 }, verification: { remained: [ "phone" ] } } as AuthOutcome;

test.each([ [ "register", true ], [ "login", false ] ] as const)(
    "%s opens stories directly and selects the correct preference direction",
    async ( origin, inherit ) => {

        await settle(success, origin);
        expect(mockOpen).toHaveBeenCalledWith("local-test-session", { id: 124 }, inherit);
        expect(mockStartStory).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith("/story");

    },
);

test("a session unmounts the auth screens beneath the story", async () => {

    await settle(success, "login");
    expect(router.dismissAll).toHaveBeenCalledTimes(1);
    expect(jest.mocked(router.dismissAll).mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(router.replace).mock.invocationCallOrder[0] ?? 0);

});

test("an OTP challenge preserves registration origin without opening a session", async () => {

    await settle({ challenge_token: "local-challenge", destination: "q***@example.test", length: 5 } as AuthOutcome, "register");
    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
        pathname: "/verify",
        params: expect.objectContaining({ origin: "register", challenge: "local-challenge" }),
    }));
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockStartStory).not.toHaveBeenCalled();

});
