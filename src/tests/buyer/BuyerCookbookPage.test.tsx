import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuyerCookbookPage from "@/app/(protected)/buyer/cookbook/page";

const mocks = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockSearchParams: new URLSearchParams(),
  mockGetMyCookbook: vi.fn(),
  mockGetCookbookRecipeDetails: vi.fn(),
  mockToggleCookbookFavorite: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.mockRouterPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mocks.mockSearchParams,
}));

vi.mock("@/lib/api/cookbook", () => ({
  getMyCookbook: mocks.mockGetMyCookbook,
  getCookbookRecipeDetails: mocks.mockGetCookbookRecipeDetails,
  toggleCookbookFavorite: mocks.mockToggleCookbookFavorite,
}));

vi.mock("@/components/buyer/RecipeQuickViewModal", () => ({
  default: (props: any) => {
    if (!props.open || !props.item) return null;

    return (
      <div role="dialog" aria-label="Recipe Quick View Modal">
        <h2>{props.item.title}</h2>

        <p>{props.loading ? "Loading details..." : "Recipe details loaded"}</p>

        {props.details?.ingredients?.length ? (
          <p>{props.details.ingredients.join(", ")}</p>
        ) : null}

        <button
          type="button"
          onClick={() => props.onFavoriteToggleAction(props.item.recipe_id)}
        >
          Mock Toggle Favorite
        </button>

        <button
          type="button"
          onClick={() => props.onReviewAction(props.item.recipe_id)}
        >
          Mock Review Recipe
        </button>

        <button type="button" onClick={props.onCloseAction}>
          Mock Close
        </button>
      </div>
    );
  },
}));

const cookbookItems = [
  {
    recipe_id: "recipe-1",
    purchase_id: "purchase-1",
    title: "Chicken Curry",
    description: "Sri Lankan spicy curry",
    image_url: "",
    difficulty_level: "Medium",
    prep_time: 10,
    cook_time: 30,
    servings: 4,
    price: 25,
    rating_avg: 4.5,
    chef_id: "seller-1",
    unlocked_at: "2026-01-02T00:00:00.000Z",
    has_reviewed: false,
    is_favorite: false,
    saved_id: null,
  },
  {
    recipe_id: "recipe-2",
    purchase_id: "purchase-2",
    title: "Milk Rice",
    description: "Traditional breakfast",
    image_url: "",
    difficulty_level: "Easy",
    prep_time: 5,
    cook_time: 20,
    servings: 3,
    price: 15,
    rating_avg: 5,
    chef_id: "seller-2",
    unlocked_at: "2026-01-01T00:00:00.000Z",
    has_reviewed: true,
    is_favorite: true,
    saved_id: "saved-1",
  },
];

const recipeDetails = {
  recipe_id: "recipe-1",
  title: "Chicken Curry",
  description: "Sri Lankan spicy curry",
  image_url: "",
  difficulty_level: "Medium",
  prep_time: 10,
  cook_time: 30,
  servings: 4,
  price: 25,
  rating_avg: 4.5,
  chef_id: "seller-1",
  ingredients: ["Chicken", "Curry powder", "Coconut milk"],
  instructions: ["Prepare ingredients", "Cook curry"],
  chef_note: "Serve hot",
};

describe("BuyerCookbookPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockSearchParams = new URLSearchParams();

    mocks.mockGetMyCookbook.mockResolvedValue(cookbookItems);

    mocks.mockGetCookbookRecipeDetails.mockResolvedValue(recipeDetails);

    mocks.mockToggleCookbookFavorite.mockResolvedValue({
      is_favorite: true,
      saved_id: "saved-new",
      message: "Added to favorites",
    });
  });

  it("loads and displays cookbook recipes", async () => {
    render(<BuyerCookbookPage />);

    expect(await screen.findByText("My Cookbook")).toBeInTheDocument();

    expect(
      (await screen.findAllByText("Chicken Curry")).length
    ).toBeGreaterThan(0);

    expect((await screen.findAllByText("Milk Rice")).length).toBeGreaterThan(0);

    expect(mocks.mockGetMyCookbook).toHaveBeenCalledWith({
      q: "",
      reviewStatus: "all",
      favoritesOnly: false,
    });
  });

  it("opens recipe quick view when View Recipe is clicked", async () => {
    const user = userEvent.setup();

    render(<BuyerCookbookPage />);

    await screen.findAllByText("Chicken Curry");

    const viewButtons = screen.getAllByRole("button", {
      name: /view recipe/i,
    });

    await user.click(viewButtons[0]);

    await waitFor(() => {
      expect(mocks.mockGetCookbookRecipeDetails).toHaveBeenCalledWith(
        "recipe-1"
      );
    });

    expect(
      await screen.findByRole("dialog", {
        name: /recipe quick view modal/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/recipe details loaded/i)).toBeInTheDocument();
  });

  it("routes to review page when Review Recipe is clicked", async () => {
    const user = userEvent.setup();

    render(<BuyerCookbookPage />);

    await screen.findAllByText("Chicken Curry");

    const reviewButtons = screen.getAllByRole("button", {
      name: /^review recipe$/i,
    });

    await user.click(reviewButtons[0]);

    expect(mocks.mockRouterPush).toHaveBeenCalledWith(
      "/buyer/review/recipe-1"
    );
  });

  it("routes to reviewed filter when Reviewed filter is clicked", async () => {
    const user = userEvent.setup();

    render(<BuyerCookbookPage />);

    await screen.findAllByText("Chicken Curry");

    await user.click(
      screen.getByRole("button", {
        name: /^reviewed/i,
      })
    );

    expect(mocks.mockRouterPush).toHaveBeenCalledWith(
      "/buyer/cookbook?reviewStatus=reviewed"
    );
  });

  it("routes to favorites filter when Favorites is clicked", async () => {
    const user = userEvent.setup();

    render(<BuyerCookbookPage />);

    await screen.findAllByText("Chicken Curry");

    await user.click(
      screen.getByRole("button", {
        name: /^favorites/i,
      })
    );

    expect(mocks.mockRouterPush).toHaveBeenCalledWith(
      "/buyer/cookbook?favoritesOnly=true"
    );
  });

  it("shows empty state when cookbook has no recipes", async () => {
    mocks.mockGetMyCookbook.mockResolvedValue([]);

    render(<BuyerCookbookPage />);

    expect(await screen.findByText(/no recipes found/i)).toBeInTheDocument();
  });

  it("shows error message when cookbook loading fails", async () => {
    mocks.mockGetMyCookbook.mockRejectedValue(
      new Error("Failed to load cookbook")
    );

    render(<BuyerCookbookPage />);

    expect(
      await screen.findByText(/failed to load cookbook/i)
    ).toBeInTheDocument();
  });
});