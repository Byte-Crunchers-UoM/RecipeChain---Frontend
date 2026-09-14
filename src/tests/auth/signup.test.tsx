import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/(auth)/signup/page";

const mocks = vi.hoisted(() => {
  const mockWeb3Auth = {
    connected: true,
    provider: {},
    logout: vi.fn(),
    getIdentityToken: vi.fn()
  };

  return {
    mockWeb3Auth,
    mockConnect: vi.fn(),
    mockRefreshSession: vi.fn(),
    mockResetAll: vi.fn(),
    mockRouterPush: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockGetPrivateKey: vi.fn(),
    mockDeriveAddress: vi.fn(),
    mockCloseModal: vi.fn(),
    mockGetSellerEntryRoute: vi.fn(),
    mockFetch: vi.fn()
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.mockRouterPush,
    replace: mocks.mockRouterReplace
  })
}));

vi.mock("@web3auth/modal/react", () => ({
  useWeb3Auth: () => ({
    web3Auth: mocks.mockWeb3Auth
  }),
  useWeb3AuthConnect: () => ({
    connect: mocks.mockConnect,
    loading: false
  })
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    refreshSession: mocks.mockRefreshSession,
    resetAll: mocks.mockResetAll
  })
}));

vi.mock("@/lib/web3/getWeb3AuthPrivKey", () => ({
  getWeb3AuthPrivateKey: mocks.mockGetPrivateKey
}));

vi.mock("@/lib/xrpl/deriveXrpl", () => ({
  deriveXrplAddressFromWeb3AuthPrivKey: mocks.mockDeriveAddress
}));

vi.mock("@/lib/web3/closeWeb3AuthModal", () => ({
  closeWeb3AuthModal: mocks.mockCloseModal
}));

vi.mock("@/lib/getSellerEntryRoute", () => ({
  getSellerEntryRoute: mocks.mockGetSellerEntryRoute
}));

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = mocks.mockFetch as unknown as typeof fetch;

    mocks.mockWeb3Auth.connected = true;
    mocks.mockWeb3Auth.provider = {};
    mocks.mockWeb3Auth.getIdentityToken.mockResolvedValue({
      idToken: "test-id-token"
    });

    mocks.mockConnect.mockResolvedValue(undefined);
    mocks.mockResetAll.mockResolvedValue(undefined);
    mocks.mockGetPrivateKey.mockResolvedValue("test-private-key");
    mocks.mockDeriveAddress.mockResolvedValue("rTestWalletAddress");
    mocks.mockCloseModal.mockResolvedValue(undefined);
    mocks.mockGetSellerEntryRoute.mockResolvedValue("/seller/kyc");

    mocks.mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        user: {
          role: "buyer"
        }
      })
    });

    mocks.mockRefreshSession.mockResolvedValue({
      role: "buyer"
    });

    (window.location.replace as unknown as Mock).mockClear();
  });

  it("renders signup UI", () => {
    render(<SignupPage />);

    expect(
      screen.getByRole("heading", { name: /create your account/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up with web3auth/i })
    ).toBeDisabled();
  });

  it("enables signup button after accepting terms", async () => {
    const user = userEvent.setup();

    render(<SignupPage />);

    const signupButton = screen.getByRole("button", {
      name: /sign up with web3auth/i
    });

    expect(signupButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));

    expect(signupButton).toBeEnabled();
  });

  it("signs up buyer and redirects to buyer profile", async () => {
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /sign up with web3auth/i })
    );

    await waitFor(() => {
      expect(mocks.mockFetch).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/web3auth/sync",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token"
          }),
          body: JSON.stringify({
            walletAddress: "rTestWalletAddress",
            mode: "signup"
          })
        })
      );
    });

    expect(mocks.mockResetAll).toHaveBeenCalled();
    expect(mocks.mockConnect).toHaveBeenCalled();

    await waitFor(() => {
      expect(window.location.replace as unknown as Mock).toHaveBeenCalledWith(
        "/buyer/profile"
      );
    });
  });

  it("signs up seller and redirects using seller KYC entry route", async () => {
    const user = userEvent.setup();

    mocks.mockRefreshSession.mockResolvedValue({
      role: "seller"
    });

    render(<SignupPage />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /sign up with web3auth/i })
    );

    await waitFor(() => {
      expect(mocks.mockGetSellerEntryRoute).toHaveBeenCalled();
    });

    expect(window.location.replace as unknown as Mock).toHaveBeenCalledWith(
      "/seller/kyc"
    );
  });

  it("shows account conflict error when backend returns 409", async () => {
    const user = userEvent.setup();

    mocks.mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: "Account already exists. Please log in instead."
      })
    });

    render(<SignupPage />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /sign up with web3auth/i })
    );

    expect(
      await screen.findByText(/account already exists/i)
    ).toBeInTheDocument();

    expect(window.location.replace as unknown as Mock).not.toHaveBeenCalled();
  });
});