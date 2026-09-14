import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerKycForm from "@/components/custom/seller-kyc/SellerKycForm";

const mocks = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockFetchMe: vi.fn(),
  mockFetchSellerKycStatus: vi.fn(),
  mockSubmitSellerKyc: vi.fn(),
  mockMarkSellerKycApprovalPageSeen: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.mockRouterPush,
    replace: mocks.mockRouterReplace,
  }),
}));

vi.mock("@/lib/api/sellerKyc", async () => {
  class ApiError extends Error {
    httpStatus: number;
    messageCode?: string;
    field?: "nicNo" | "phoneNo";
    status?: "pending" | "rejected" | "approved";
    friendlyMessage?: string;

    constructor(
      message: string,
      httpStatus: number,
      extra?: {
        messageCode?: string;
        field?: string;
        status?: string;
        friendlyMessage?: string;
      }
    ) {
      super(message);
      this.name = "ApiError";
      this.httpStatus = httpStatus;
      this.messageCode = extra?.messageCode;
      this.field = extra?.field as "nicNo" | "phoneNo" | undefined;
      this.status = extra?.status as "pending" | "rejected" | "approved" | undefined;
      this.friendlyMessage = extra?.friendlyMessage;
    }
  }

  return {
    ApiError,
    fetchMe: mocks.mockFetchMe,
    fetchSellerKycStatus: mocks.mockFetchSellerKycStatus,
    submitSellerKyc: mocks.mockSubmitSellerKyc,
    markSellerKycApprovalPageSeen: mocks.mockMarkSellerKycApprovalPageSeen,
  };
});

const defaultSellerUserResponse = {
  success: true,
  data: {
    user_id: "seller-1",
    email: "seller@test.com",
    role: "seller",
    wallet_address: "rSellerWalletAddress",
  },
};

const defaultKycStatus = {
  verification_status: null,
  verification_submitted_at: null,
  verified_at: null,
  rejection_reason: null,
  kyc_approval_page_seen: false,
  full_name: "",
  date_of_birth: "",
  nationality: "",
  address: "",
  phone_no: "",
  nic_no: "",
  id_document_front_url: "",
  id_document_back_url: "",
  id_document_front_original_name: "",
  id_document_back_original_name: "",
};

describe("SellerKycForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockFetchMe.mockResolvedValue(defaultSellerUserResponse);
    mocks.mockFetchSellerKycStatus.mockResolvedValue(defaultKycStatus);
    mocks.mockSubmitSellerKyc.mockResolvedValue({
      success: true,
      message: "Verification submitted successfully.",
    });
    mocks.mockMarkSellerKycApprovalPageSeen.mockResolvedValue({
      success: true,
      data: {
        kyc_approval_page_seen: true,
      },
    });
  });

  it("loads seller KYC form for seller user", async () => {
    render(<SellerKycForm />);

    expect(
      await screen.findByRole("button", {
        name: /submit for review/i,
      })
    ).toBeInTheDocument();

    expect(mocks.mockFetchMe).toHaveBeenCalled();
    expect(mocks.mockFetchSellerKycStatus).toHaveBeenCalled();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();

    render(<SellerKycForm />);

    const submitButton = await screen.findByRole("button", {
      name: /submit for review/i,
    });

    await user.click(submitButton);

    expect(
      await screen.findByText(/full name is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/date of birth is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/nationality is required/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/address is required/i)).toBeInTheDocument();

    expect(
      screen.getByText(/phone number is required/i)
    ).toBeInTheDocument();

    expect(mocks.mockSubmitSellerKyc).not.toHaveBeenCalled();
  });

  it("does not load KYC status for non-seller user", async () => {
    mocks.mockFetchMe.mockResolvedValue({
      success: true,
      data: {
        user_id: "buyer-1",
        email: "buyer@test.com",
        role: "buyer",
        wallet_address: "rBuyerWalletAddress",
      },
    });

    render(<SellerKycForm />);

    await waitFor(() => {
      expect(mocks.mockFetchMe).toHaveBeenCalled();
    });

    expect(mocks.mockFetchSellerKycStatus).not.toHaveBeenCalled();
  });

  it("shows pending KYC view when verification status is pending", async () => {
    mocks.mockFetchSellerKycStatus.mockResolvedValue({
      verification_status: "pending",
      verification_submitted_at: "2026-01-01T00:00:00.000Z",
      verified_at: null,
      rejection_reason: null,
      kyc_approval_page_seen: false,
      full_name: "Amal Seller",
      date_of_birth: "2000-01-01",
      nationality: "Sri Lankan",
      address: "Colombo",
      phone_no: "+94753681070",
      nic_no: "200012345678",
      id_document_front_url: "",
      id_document_back_url: "",
      id_document_front_original_name: "front.png",
      id_document_back_original_name: "back.png",
    });

    render(<SellerKycForm />);

    expect(
      await screen.findByRole("heading", {
        name: /your verification is being reviewed/i,
      })
    ).toBeInTheDocument();

    expect((await screen.findAllByText(/under review/i)).length).toBeGreaterThan(
      0
    );
  });
});