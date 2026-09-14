import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuyerProfilePage from "@/app/(protected)/buyer/profile/page";

const mocks = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockUseSearchParamsValue: new URLSearchParams(),
  mockGetMyBuyerProfile: vi.fn(),
  mockUpdateMyBuyerProfile: vi.fn(),
  mockDeleteMyAccountPermanently: vi.fn(),
  mockGetMyWalletOverview: vi.fn(),
  mockLogout: vi.fn(),
  mockResetAll: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.mockRouterPush,
    replace: mocks.mockRouterReplace,
  }),
  usePathname: () => "/buyer/profile",
  useSearchParams: () => mocks.mockUseSearchParamsValue,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      user_id: "buyer-1",
      email: "buyer@test.com",
      role: "buyer",
    },
    role: "buyer",
    isAuthenticated: true,
    isLoading: false,
    logout: mocks.mockLogout,
    resetAll: mocks.mockResetAll,
    refreshSession: vi.fn(),
    setRole: vi.fn(),
    clearRole: vi.fn(),
  }),
}));

vi.mock("@/lib/api/buyer", () => ({
  getMyBuyerProfile: mocks.mockGetMyBuyerProfile,
  updateMyBuyerProfile: mocks.mockUpdateMyBuyerProfile,
  deleteMyAccountPermanently: mocks.mockDeleteMyAccountPermanently,
}));

vi.mock("@/lib/api/wallet", () => ({
  getMyWalletOverview: mocks.mockGetMyWalletOverview,
}));

vi.mock("@/components/buyer/EditProfileModal", () => ({
  default: (props: any) => {
    if (!props.open) return null;

    return (
      <div role="dialog" aria-label="Edit Profile Modal">
        <p>Edit Profile Modal Open</p>

        <button
          type="button"
          onClick={() =>
            props.onSaveAction({
              displayName: "Updated Buyer",
              bio: "Updated bio",
              profilePhoto: null,
            })
          }
        >
          Mock Save Profile
        </button>

        <button type="button" onClick={props.onCloseAction}>
          Mock Close Modal
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/buyer/WalletTopUpModal", () => ({
  default: (props: any) => {
    if (!props.open) return null;

    return (
      <div role="dialog" aria-label="Wallet Top Up Modal">
        Wallet Top Up Modal
      </div>
    );
  },
}));

vi.mock("@/components/buyer/WalletWithdrawModal", () => ({
  default: (props: any) => {
    if (!props.open) return null;

    return (
      <div role="dialog" aria-label="Wallet Withdraw Modal">
        Wallet Withdraw Modal
      </div>
    );
  },
}));

vi.mock("@/components/buyer/WalletTransactionHistory", () => ({
  default: (props: any) => {
    const transactions =
      props.transactions ||
      props.initialTransactions ||
      props.walletTransactions ||
      [];

    return (
      <section aria-label="Wallet Transactions">
        <h2>Wallet Transactions</h2>
        <p>{transactions.length} wallet transaction(s)</p>
      </section>
    );
  },
}));

const mockProfile = {
  user_id: "buyer-1",
  email: "buyer@test.com",
  wallet_address: "rBuyerWalletAddress",
  joined_at: "2026-01-01T00:00:00.000Z",
  role: "buyer",
  display_name: "Amal Buyer",
  bio: "Recipe lover",
  profile_picture: "",
  total_purchases: 3,
  total_spent_xrp: 75,
  account_balance: 120,
  saved_recipes_count: 5,
  feedback_count: 2,
  notification_count: 0,
  cart_count: 0,
  badges: [
    {
      key: "first_purchase",
      title: "First Taste",
      description: "Completed first recipe purchase",
      earned: true,
    },
    {
      key: "top_buyer",
      title: "Top Buyer",
      description: "Purchased 10+ recipes",
      earned: false,
    },
  ],
  recent_activity: [
    {
      id: "activity-1",
      title: "Chicken Curry",
      amount_xrp: 25,
      status: "completed",
      date: "2026-01-02T00:00:00.000Z",
    },
  ],
};

const updatedMockProfile = {
  ...mockProfile,
  display_name: "Updated Buyer",
  bio: "Updated bio",
};

const mockWalletOverview = {
  wallet_address: "rBuyerWalletAddress",
  account_balance: 120,
  balance_xrp: 120,
  recent_transactions: [
    {
      transaction_id: "tx-1",
      type: "topup",
      direction: "credit",
      amount: 50,
      amount_xrp: 50,
      currency: "XRP",
      status: "completed",
      description: "Card top-up completed",
      created_at: "2026-01-02T00:00:00.000Z",
    },
  ],
};

describe("BuyerProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseSearchParamsValue = new URLSearchParams();

    mocks.mockGetMyBuyerProfile.mockResolvedValue(mockProfile);
    mocks.mockUpdateMyBuyerProfile.mockResolvedValue(updatedMockProfile);
    mocks.mockGetMyWalletOverview.mockResolvedValue(mockWalletOverview);
    mocks.mockDeleteMyAccountPermanently.mockResolvedValue(undefined);
    mocks.mockLogout.mockResolvedValue(undefined);
    mocks.mockResetAll.mockResolvedValue(undefined);
  });

  it("loads and displays buyer profile data", async () => {
    render(<BuyerProfilePage />);

    expect((await screen.findAllByText("Amal Buyer")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("buyer@test.com")).length).toBeGreaterThan(0);
    expect(screen.getByText(/recipe lover/i)).toBeInTheDocument();

    expect(mocks.mockGetMyBuyerProfile).toHaveBeenCalled();
    expect(mocks.mockGetMyWalletOverview).toHaveBeenCalled();
  });

  it("shows wallet transaction section", async () => {
    render(<BuyerProfilePage />);

    expect(await screen.findByText("Wallet Transactions")).toBeInTheDocument();
    expect(screen.getByText("1 wallet transaction(s)")).toBeInTheDocument();
  });

  it("opens edit profile modal and saves profile", async () => {
    const user = userEvent.setup();

    render(<BuyerProfilePage />);

    await screen.findAllByText("Amal Buyer");

    const editButtons = await screen.findAllByRole("button", {
      name: /edit profile/i,
    });

    await user.click(editButtons[0]);

    expect(
      screen.getByRole("dialog", {
        name: /edit profile modal/i,
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /mock save profile/i,
      })
    );

    await waitFor(() => {
      expect(mocks.mockUpdateMyBuyerProfile).toHaveBeenCalledWith({
        displayName: "Updated Buyer",
        bio: "Updated bio",
        profilePhoto: null,
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText("Updated Buyer").length).toBeGreaterThan(0);
    });
  });

  it("shows error message when profile loading fails", async () => {
    mocks.mockGetMyBuyerProfile.mockRejectedValue(
      new Error("Failed to load buyer profile")
    );

    render(<BuyerProfilePage />);

    expect(
      await screen.findByText(/failed to load buyer profile/i)
    ).toBeInTheDocument();
  });
});